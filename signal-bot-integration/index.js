const express = require("express");
const { spawn, exec } = require("child_process");
const fs = require("fs");
const cron = require("node-cron");

const app = express();
const PORT = process.env.PORT || 3000;

// Load config
let config;
try {
  config = JSON.parse(fs.readFileSync("config/bot-config.json", "utf8"));
} catch (error) {
  console.error("Config error:", error);
  process.exit(1);
}

console.log("Signal DevOps Bot v2.0");
console.log("Phone:", config.signal.phone_number);

app.use(express.json());

const botState = {
  uptime: Date.now(),
  lastDeployment: null,
  metrics: { cpu: 0, memory: 0, disk: 0 }
};

class SignalDevOpsBot {
  constructor() {
    this.phoneNumber = config.signal.phone_number;
    this.groupId = config.signal.group_id;
    this.process = null;
    this.messageHandlers = new Map();
    this.setupHandlers();
  }

  setupHandlers() {
    this.messageHandlers.set("deploy", this.handleDeploy.bind(this));
    this.messageHandlers.set("status", this.handleStatus.bind(this));
    this.messageHandlers.set("restart", this.handleRestart.bind(this));
    this.messageHandlers.set("logs", this.handleLogs.bind(this));
    this.messageHandlers.set("help", this.handleHelp.bind(this));
  }

  start() {
    console.log("Starting Signal CLI...");
    this.process = spawn("/usr/local/bin/signal-cli", ["-a", this.phoneNumber, "receive"], {
      stdio: ["pipe", "pipe", "pipe"]
    });

    this.process.stdout.on("data", (data) => {
      this.processSignalOutput(data.toString());
    });

    this.process.stderr.on("data", (data) => {
      console.error("Signal Error:", data.toString().trim());
    });

    this.process.on("close", (code) => {
      console.log("Signal process closed:", code);
      setTimeout(() => this.start(), 5000);
    });
  }

  processSignalOutput(output) {
    const lines = output.split("\n");
    for (const line of lines) {
      if (line.includes("Body:")) {
        const messageText = line.split("Body: ")[1]?.trim();
        if (messageText && messageText.startsWith(config.commands.prefix)) {
          this.handleCommand(messageText);
        }
      }
    }
  }

  handleCommand(message) {
    const command = message.substring(1).toLowerCase().split(" ")[0];
    const args = message.substring(1).toLowerCase().split(" ").slice(1);
    
    console.log("Command:", command);

    if (this.messageHandlers.has(command)) {
      this.messageHandlers.get(command)(args);
    } else {
      this.sendMessage("Unknown command: " + command + "\nUse /help");
    }
  }

  async sendMessage(text) {
    try {
      const process = spawn("/usr/local/bin/signal-cli", [
        "-a", this.phoneNumber,
        "send", "-g", this.groupId,
        "-m", text
      ]);

      process.on("close", (code) => {
        if (code === 0) {
          console.log("Message sent");
        }
      });
    } catch (error) {
      console.error("Send error:", error.message);
    }
  }

  async handleDeploy(args) {
    const environment = args[0] || "production";
    await this.sendMessage("Deploying to " + environment + "...");
    
    try {
      await this.executeCommand("cd /root/devops-cicd-playground && git pull && docker-compose up -d --build");
      await this.sendMessage("Deploy to " + environment + " completed\!");
      botState.lastDeployment = new Date().toISOString();
    } catch (error) {
      await this.sendMessage("Deploy error: " + error.message);
    }
  }

  async handleStatus(args) {
    await this.sendMessage("System Status: CPU=" + botState.metrics.cpu + "%, RAM=" + botState.metrics.memory + "%");
  }

  async handleRestart(args) {
    const service = args[0] || "backend";
    await this.sendMessage("Restarting " + service + "...");
    
    try {
      await this.executeCommand("docker-compose restart " + service);
      await this.sendMessage(service + " restarted");
    } catch (error) {
      await this.sendMessage("Restart error: " + error.message);
    }
  }

  async handleLogs(args) {
    const service = args[0] || "backend";
    try {
      const logs = await this.executeCommand("docker-compose logs --tail=20 " + service);
      await this.sendMessage("Logs for " + service + ":\n" + logs);
    } catch (error) {
      await this.sendMessage("Logs error: " + error.message);
    }
  }

  async handleHelp(args) {
    const help = "Commands:\n/status - system status\n/deploy [env] - deploy\n/restart [svc] - restart\n/logs [svc] - logs\n/help - help";
    await this.sendMessage(help);
  }

  async executeCommand(command) {
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) reject(error);
        else resolve(stdout);
      });
    });
  }
}

const signalBot = new SignalDevOpsBot();

app.post("/webhook/github", async (req, res) => {
  await signalBot.sendMessage("GitHub: New push to main");
  res.json({ received: true });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", uptime: Date.now() - botState.uptime });
});

app.get("/api/bot/send", async (req, res) => {
  const { message } = req.query;
  if (message) {
    await signalBot.sendMessage(message);
    res.json({ success: true, message });
  } else {
    res.status(400).json({ error: "Message required" });
  }
});

cron.schedule("*/5 * * * *", async () => {
  console.log("Updating metrics...");
});

signalBot.start();

app.listen(PORT, "0.0.0.0", () => {
  console.log("API running on port " + PORT);
  console.log("Signal Bot ready\!");
});

process.on("SIGINT", () => {
  console.log("Stopping bot...");
  if (signalBot.process) signalBot.process.kill();
  process.exit(0);
});
