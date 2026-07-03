export interface KBArticle {
  slug: string
  title: string
  excerpt: string
  content: string
  categorySlug: string
  categoryName: string
}

export interface KBCategory {
  name: string
  slug: string
  icon: string
  description: string
}

export const CATEGORIES: KBCategory[] = [
  { name: "Minecraft Hosting", slug: "minecraft-hosting", icon: "Server", description: "Server setup, modpack installation, configuration guides" },
  { name: "VPS Hosting", slug: "vps-hosting", icon: "Cloud", description: "Server management, security, optimization tips" },
  { name: "Discord Bots", slug: "discord-bots", icon: "Bot", description: "Bot deployment, troubleshooting, best practices" },
  { name: "Billing", slug: "billing", icon: "FileText", description: "Payments, invoices, refunds, plan changes" },
  { name: "Getting Started", slug: "getting-started", icon: "BookOpen", description: "Account setup, first steps, quick start guides" },
  { name: "FAQ", slug: "faq", icon: "HelpCircle", description: "Common questions and answers" },
]

export const ARTICLES: KBArticle[] = [
  {
    slug: "how-to-install-a-modpack",
    title: "How to Install a Modpack on Your Minecraft Server",
    excerpt: "Step-by-step guide to installing any modpack on your Minecraft server.",
    categorySlug: "minecraft-hosting",
    categoryName: "Minecraft Hosting",
    content: `This guide walks you through installing any modpack on your CynexCloud Minecraft server.

## Prerequisites

Before you begin, make sure you have:

- An active Minecraft server on CynexCloud
- Access to the Pterodactyl panel (you can find the link in your service details)
- A modpack you want to install (from CurseForge, Modrinth, or elsewhere)

## Step 1: Access Your Server Panel

1. Log in to your CynexCloud dashboard
2. Navigate to **Services** and click on your Minecraft server
3. Click the **Manage in Panel** button to open the Pterodactyl panel

## Step 2: Stop Your Server

In the Pterodactyl panel:

1. Go to the **Console** tab
2. Click the **Stop** button (red power icon)
3. Wait for the server process to fully stop (the status will show "Offline")

Always stop your server before making major changes to avoid file corruption.

## Step 3: Upload Your Modpack

### Option A: Using a Pre-made Modpack ZIP

1. In Pterodactyl, go to the **File Manager** tab
2. Navigate to the root directory of your server
3. Delete any existing mods in the \`mods\` folder (if you want a fresh install)
4. Upload your modpack ZIP file by dragging it into the file manager
5. Right-click the uploaded ZIP and select **Unarchive**
6. If the modpack includes a \`mods\` folder, its contents should now be in place

### Option B: Using CurseForge / Modrinth

1. Visit CurseForge or Modrinth and find your desired modpack
2. Download the server files version of the modpack
3. Follow Option A steps above to upload and extract

## Step 4: Configure Server Settings

Most modpacks require specific Minecraft version and memory settings:

1. Go to the **Startup** tab in Pterodactyl
2. Set **Server Jar File** to the correct JAR file (usually \`server.jar\` or \`forge-*.jar\`)
3. Set **BungeeCord** to off unless you are using a proxy network
4. Adjust the memory allocation — most modpacks need at least 4GB of RAM

## Step 5: Start Your Server

1. Go back to the **Console** tab
2. Click **Start** to boot up the server with the modpack
3. Watch the console output for any errors
4. The first start may take a few minutes as it generates world files and installs dependencies

## Step 6: Accept the EULA

Most Minecraft servers require you to accept the Mojang EULA:

1. In the file manager, open \`eula.txt\`
2. Change \`eula=false\` to \`eula=true\`
3. Save the file, then restart your server

## Troubleshooting

**Server crashes on startup:** Check the console logs for error messages. Common issues include:
- Insufficient memory allocated
- Missing dependencies (check the modpack requirements)
- Version mismatch between mods and server

**Mods not loading:** Verify the mods are in the \`mods\` directory and are compatible with your server version.

**World generation errors:** Delete the \`world\` folder and restart — a fresh world will generate.

## Need More Help?

Contact our support team through the CynexCloud dashboard if you encounter any issues not covered here.`
  },
  {
    slug: "configuring-server-properties",
    title: "Configuring Server Properties for Optimal Performance",
    excerpt: "Optimize your server experience by configuring server.properties.",
    categorySlug: "minecraft-hosting",
    categoryName: "Minecraft Hosting",
    content: `Your Minecraft server's \`server.properties\` file controls nearly every gameplay setting. This guide explains the most important options and their optimal values for different server types.

## Locating server.properties

1. Log into the Pterodactyl panel via your CynexCloud service dashboard
2. Go to **File Manager**
3. Navigate to the root directory
4. Find and click on \`server.properties\`

## Essential Settings

### Server Name and MOTD

\`\`\`properties
motd=A Minecraft Server
\`\`\`

This is the message displayed in the multiplayer server list. Use section symbols (§) for color codes:

\`\`\`properties
motd=§6CynexCloud §fMinecraft Server
\`\`\`

### Game Mode

\`\`\`properties
gamemode=survival
\`\`\`

Options: \`survival\`, \`creative\`, \`adventure\`, \`spectator\`

### Difficulty

\`\`\`properties
difficulty=easy
\`\`\`

Options: \`peaceful\`, \`easy\`, \`normal\`, \`hard\`

### Max Players

\`\`\`properties
max-players=20
\`\`\`

Set this to match your plan's player slot limit. Higher values use more memory even when empty.

### View Distance

\`\`\`properties
view-distance=8
\`\`\`

Controls how far (in chunks) the server sends data to players. Lower values (4–8) improve performance. Higher values (10–16) are for powerful servers with fewer players.

## Performance Optimization

### Simulation Distance

\`\`\`properties
simulation-distance=8
\`\`\`

Controls how far entities and redstone are processed. Set lower than view-distance to save CPU.

### Network Compression

\`\`\`properties
network-compression-threshold=256
\`\`\`

Higher values reduce CPU usage but increase bandwidth. For most servers, the default 256 is fine.

### Max Tick Time

\`\`\`properties
max-tick-time=-1
\`\`\`

Setting this to \`-1\` disables the watchdog that crashes the server if it freezes. Useful for servers with heavy redstone or many entities.

## PVP and PVE Settings

### Enable PVP

\`\`\`properties
pvp=true
\`\`\`

Set to \`false\` for a peaceful or building-focused server.

### Allow Flight

\`\`\`properties
allow-flight=false
\`\`\`

Enable this if you have plugins that allow flying, otherwise the server may kick players for "flying".

### Spawn Protection

\`\`\`properties
spawn-protection=16
\`\`\`

Set to \`0\` to disable spawn protection entirely (recommended for survival servers).

## World Settings

### Seed

\`\`\`properties
level-seed=
\`\`\`

Leave blank for random. Enter a specific seed to generate identical terrain across restarts.

### World Type

\`\`\`properties
level-type=default
\`\`\`

Options: \`default\`, \`flat\`, \`largebiomes\`, \`amplified\`, \`buffet\`

### Generate Structures

\`\`\`properties
generate-structures=true
\`\`\`

Set to \`false\` to disable villages, temples, and other generated structures.

## Security Settings

### Enable Query

\`\`\`properties
enable-query=false
\`\`\`

Useful for server listing sites. Enable if you want your server to appear on external trackers.

### Enforce Secure Profile

\`\`\`properties
enforce-secure-profile=true
\`\`\`

Requires players to have a Microsoft account with a secure profile. Recommended for public servers to prevent chat reporting bypasses.

## Applying Changes

After editing \`server.properties\`:

1. Save the file in the file manager
2. Restart your server from the Console tab
3. Changes take effect immediately on restart

## Pro Tips

- Take a backup of \`server.properties\` before making major changes
- Change one setting at a time to isolate performance impacts
- Use online MOTD generators to create colorful server descriptions
- Monitor TPS (ticks per second) after changing view distance — aim for 20 TPS`
  },
  {
    slug: "setting-up-permissions",
    title: "Setting Up Permissions with LuckPerms",
    excerpt: "Learn how to set up permission groups with LuckPerms.",
    categorySlug: "minecraft-hosting",
    categoryName: "Minecraft Hosting",
    content: `LuckPerms is the most popular permissions plugin for Minecraft servers. This guide covers installation, group setup, and permission assignment.

## Installing LuckPerms

1. Download the LuckPerms JAR for your server version from the official website or Modrinth
2. Upload the JAR to your server's \`plugins\` folder via the Pterodactyl file manager
3. Restart your server
4. LuckPerms will generate its data files automatically

## Basic Commands

All LuckPerms commands require the \`luckperms.*\` permission or operator status.

### Creating Groups

\`\`\`
/lp creategroup default
/lp creategroup member
/lp creategroup vip
/lp creategroup moderator
/lp creategroup admin
\`\`\`

### Setting Group Permissions

\`\`\`
# Basic permissions for all players
/lp group default permission set minecraft.command.list true
/lp group default permission set minecraft.command.me true
/lp group default permission set minecraft.command.help true
/lp group default permission set minecraft.command.msg true

# Member permissions (includes default + extras)
/lp group member permission set minecraft.command.sethome true
/lp group member permission set minecraft.command.tpa true
/lp group member permission set minecraft.command.spawn true

# VIP permissions
/lp group vip permission set minecraft.command.fly true
/lp group vip permission set minecraft.command.gamemode true

# Moderator permissions
/lp group moderator permission set minecraft.command.ban true
/lp group moderator permission set minecraft.command.kick true
/lp group moderator permission set minecraft.command.mute true
/lp group moderator permission set minecraft.command.tp true

# Admin permissions
/lp group admin permission set * true
\`\`\`

### Setting Up Inheritance

This allows each group to inherit permissions from groups below it:

\`\`\`
/lp group member parent add default
/lp group vip parent add member
/lp group moderator parent add vip
/lp group admin parent add moderator
\`\`\`

### Assigning Players to Groups

\`\`\`
/lp user Notch parent set admin
/lp user Steve parent set vip
/lp user Alex parent set member
\`\`\`

## Using Prefixes and Suffixes

Set display names in chat and tab menus:

\`\`\`
/lp group admin meta set prefix "&4[Admin] &c"
/lp group moderator meta set prefix "&9[Mod] &b"
/lp group vip meta set prefix "&6[VIP] &e"
/lp group member meta set prefix "&7[Member] &f"
/lp group default meta set prefix "&8[Player] &7"
\`\`\`

## Permission Inheritance Tree

\`\`\`
admin ── has all permissions
  ↑
moderator ── inherits VIP + member + default
  ↑
vip ── inherits member + default
  ↑
member ── inherits default
  ↑
default ── base permissions
\`\`\`

## Checking Permissions

### Check a player's permissions:
\`\`\`
/lp user Alex permission check minecraft.command.fly
\`\`\`

### Check a group's permissions:
\`\`\`
/lp group vip info
\`\`\`

## Using Permission Files (Advanced)

You can also define permissions in YAML files:

\`\`\`yaml
# plugins/LuckPerms/groups.yml
groups:
  default:
    permissions:
    - minecraft.command.list
    - minecraft.command.help
  vip:
    permissions:
    - minecraft.command.fly
    parents:
    - default
\`\`\`

## Best Practices

1. **Use groups, not individual player permissions** — easier to manage at scale
2. **Keep inheritance chains shallow** — deep chains slow down lookups
3. **Use wildcards sparingly** — \`*\` grants everything including plugin commands you may not want
4. **Test permissions on a staging server** before deploying to production
5. **Back up your LuckPerms data** regularly — stored in \`plugins/LuckPerms/\`
6. **Use temporary permissions for trial ranks** — \`/lp group trial temp 7d\`

## Troubleshooting

**Permissions not applying:** Run \`/lp sync\` to reload all permission data from disk.

**Player has wrong permissions:** Check inheritance with \`/lp user <name> parent info\`.

**Plugin permissions not showing:** Most plugins document their permission nodes on their Spigot/Modrinth page.`,
  },
  {
    slug: "securing-your-vps",
    title: "Securing Your VPS",
    excerpt: "Essential security measures to protect your virtual private server.",
    categorySlug: "vps-hosting",
    categoryName: "VPS Hosting",
    content: `A secure VPS is essential for protecting your data, users, and applications. This guide covers fundamental security measures every VPS owner should implement.

## 1. Update Your System

Always start with a fully updated system:

\`\`\`bash
# Debian / Ubuntu
sudo apt update && sudo apt upgrade -y

# CentOS / RHEL / AlmaLinux
sudo dnf update -y
\`\`\`

Then enable automatic security updates:

\`\`\`bash
sudo apt install unattended-upgrades -y
sudo dpkg-reconfigure --priority=low unattended-upgrades
\`\`\`

## 2. Create a Sudo User

Never run as root for daily tasks:

\`\`\`bash
# Create a new user
sudo adduser cynexadmin

# Grant sudo privileges
sudo usermod -aG sudo cynexadmin

# Test sudo access
su - cynexadmin
sudo whoami
# Should output: root
\`\`\`

## 3. Harden SSH Access

### Disable root login and password auth:

\`\`\`bash
sudo nano /etc/ssh/sshd_config
\`\`\`

Change these lines:

\`\`\`
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
Port 2222  # Change from default 22 to reduce bots
MaxAuthTries 3
\`\`\`

Then restart SSH:

\`\`\`bash
sudo systemctl restart sshd
\`\`\`

### Set up SSH key authentication:

\`\`\`bash
# On your local machine
ssh-keygen -t ed25519 -a 100
ssh-copy-id -p 2222 cynexadmin@your-server-ip
\`\`\`

## 4. Configure a Firewall

### Using UFW (Ubuntu/Debian):

\`\`\`bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 2222/tcp        # SSH (your custom port)
sudo ufw allow 80/tcp          # HTTP
sudo ufw allow 443/tcp         # HTTPS
sudo ufw --force enable
sudo ufw status verbose
\`\`\`

### Using firewalld (CentOS/RHEL):

\`\`\`bash
sudo firewall-cmd --permanent --add-port=2222/tcp
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
sudo firewall-cmd --list-all
\`\`\`

## 5. Install Fail2ban

Fail2ban blocks IPs after repeated failed login attempts:

\`\`\`bash
sudo apt install fail2ban -y
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
\`\`\`

Edit \`/etc/fail2ban/jail.local\`:

\`\`\`ini
[sshd]
enabled = true
port = 2222
maxretry = 3
bantime = 3600
findtime = 600
\`\`\`

Enable and start:

\`\`\`bash
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
sudo fail2ban-client status sshd
\`\`\`

## 6. Set Up Automatic Backups

\`\`\`bash
# Install backup tool
sudo apt install rsync -y

# Create backup script
sudo nano /usr/local/bin/backup.sh
\`\`\`

\`\`\`bash
#!/bin/bash
BACKUP_DIR="/backups/$(date +%Y-%m-%d)"
mkdir -p "$BACKUP_DIR"
rsync -avz --exclude={"/proc","/sys","/dev","/tmp","/mnt"} / "$BACKUP_DIR"
\`\`\`

\`\`\`bash
sudo chmod +x /usr/local/bin/backup.sh
sudo crontab -e
# Add: 0 3 * * * /usr/local/bin/backup.sh  (runs daily at 3 AM)
\`\`\`

## 7. Monitor Your Server

### Check for suspicious activity:

\`\`\`bash
# Last login attempts
sudo last -10

# Failed SSH attempts
sudo cat /var/log/auth.log | grep "Failed password" | tail -10

# Current connections
sudo netstat -tunpa | grep ESTABLISHED

# Running processes by resource
ps aux --sort=-%mem | head -10
\`\`\`

### Install a monitoring tool:

\`\`\`bash
sudo apt install htop nload -y
htop          # Process monitoring
nload         # Network bandwidth
\`\`\`

## 8. Application-Level Security

### For web servers:

\`\`\`bash
# Install ModSecurity (Apache)
sudo apt install libapache2-mod-security2 -y

# Or for Nginx
# Use a Web Application Firewall like NAXSI
\`\`\`

### For databases:

\`\`\`bash
# Bind MySQL to localhost only
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
# Change: bind-address = 127.0.0.1
sudo systemctl restart mysql
\`\`\`

## 9. Regular Maintenance Checklist

- [ ] Run \`sudo apt update && sudo apt upgrade\` weekly
- [ ] Review \`/var/log/auth.log\` for unauthorized access attempts
- [ ] Check disk usage with \`df -h\` (keep below 80%)
- [ ] Review open ports with \`sudo netstat -tulpn\`
- [ ] Rotate logs: \`sudo logrotate -f /etc/logrotate.conf\`
- [ ] Verify backups are actually working

## Quick Security Audit

Run this to check your VPS security posture:

\`\`\`bash
echo "SSH config:" && sudo sshd -T | grep -E "(permitrootlogin|passwordauthentication|port)"
echo "Firewall:" && sudo ufw status
echo "Open ports:" && sudo ss -tulpn | grep LISTEN
echo "Failed login attempts:" && sudo cat /var/log/auth.log | grep "Failed password" | wc -l
\`\`\`

## Need Help?

If you suspect your VPS has been compromised, contact CynexCloud support immediately. We can help you restore from a backup and implement additional security measures.`
  },
  {
    slug: "vps-performance-optimization",
    title: "VPS Performance Optimization Tips",
    excerpt: "Tips to optimize your VPS for maximum performance.",
    categorySlug: "vps-hosting",
    categoryName: "VPS Hosting",
    content: `Maximize your VPS performance with these optimization techniques. From kernel tuning to application-level adjustments, this guide covers everything you need.

## 1. Choose the Right Plan

Start with the right resources for your workload:

- **Web hosting:** 2 vCPU, 4GB RAM, 80GB SSD
- **Application server:** 4 vCPU, 8GB RAM, 160GB SSD
- **Database server:** 4 vCPU, 16GB RAM, 320GB SSD (NVMe recommended)
- **High-traffic:** 8+ vCPU, 32GB+ RAM, NVMe storage

Monitor usage regularly and scale up when consistently above 70% utilization.

## 2. Kernel Parameter Tuning

Optimize sysctl settings for better network and memory performance:

\`\`\`bash
sudo nano /etc/sysctl.d/99-performance.conf
\`\`\`

\`\`\`
# Increase network buffer sizes
net.core.rmem_max = 134217728
net.core.wmem_max = 134217728
net.ipv4.tcp_rmem = 4096 87380 134217728
net.ipv4.tcp_wmem = 4096 65536 134217728

# Enable TCP BBR congestion control
net.core.default_qdisc = fq
net.ipv4.tcp_congestion_control = bbr

# Increase max connections
net.core.somaxconn = 65535
net.ipv4.tcp_max_syn_backlog = 65535

# Enable fast recycling
net.ipv4.tcp_tw_reuse = 1
net.ipv4.tcp_fin_timeout = 15

# Memory management
vm.swappiness = 10
vm.vfs_cache_pressure = 50
vm.dirty_ratio = 30
vm.dirty_background_ratio = 5

# File system
fs.file-max = 2097152
\`\`\`

Apply the changes:

\`\`\`bash
sudo sysctl --system
\`\`\`

## 3. I/O Scheduler Tuning

For SSD/NVMe drives, use the \`none\` scheduler:

\`\`\`bash
# Check current scheduler
cat /sys/block/sda/queue/scheduler

# Set to none (NVMe/SSD)
echo none | sudo tee /sys/block/sda/queue/scheduler

# Make permanent
sudo nano /etc/default/grub
# Add: elevator=noop to GRUB_CMDLINE_LINUX_DEFAULT
sudo update-grub
\`\`\`

## 4. Disable Unused Services

Identify and stop services you don't need:

\`\`\`bash
# List all running services
systemctl list-units --type=service --state=running

# Disable what you don't need
sudo systemctl disable --now bluetooth.service
sudo systemctl disable --now cups.service
sudo systemctl disable --now avahi-daemon.service
sudo systemctl disable --now postfix.service  # if not using mail
\`\`\`

## 5. Web Server Optimization

### Nginx:

\`\`\`bash
sudo nano /etc/nginx/nginx.conf
\`\`\`

\`\`\`nginx
worker_processes auto;
worker_connections 4096;
use epoll;
multi_accept on;

sendfile on;
tcp_nopush on;
tcp_nodelay on;

keepalive_timeout 15;
keepalive_requests 100;

gzip on;
gzip_comp_level 3;
gzip_types text/css application/javascript image/svg+xml;

client_max_body_size 100M;
\`\`\`

### Apache:

\`\`\`bash
sudo nano /etc/apache2/apache2.conf
\`\`\`

\`\`\`apache
KeepAlive On
MaxKeepAliveRequests 100
KeepAliveTimeout 5
StartServers 4
MinSpareServers 4
MaxSpareServers 16
MaxRequestWorkers 256
MaxConnectionsPerChild 10000
\`\`\`

## 6. Database Optimization

### MySQL / MariaDB:

\`\`\`bash
sudo nano /etc/mysql/my.cnf
\`\`\`

\`\`\`ini
[mysqld]
innodb_buffer_pool_size = 2G          # Set to 50-70% of available RAM
innodb_log_file_size = 512M
innodb_flush_log_at_trx_commit = 2    # Better performance (slightly less durable)
innodb_flush_method = O_DIRECT
innodb_file_per_table = 1
max_connections = 500
query_cache_type = 0                  # Disable query cache in MySQL 8+
query_cache_size = 0
tmp_table_size = 256M
max_heap_table_size = 256M
\`\`\`

### PostgreSQL:

\`\`\`bash
sudo nano /etc/postgresql/*/main/postgresql.conf
\`\`\`

\`\`\`ini
shared_buffers = 2GB                  # 25% of RAM
effective_cache_size = 6GB            # 50-75% of RAM
work_mem = 64MB                       # Per query sort operation
maintenance_work_mem = 512MB
random_page_cost = 1.1                # For SSD storage
effective_io_concurrency = 200
wal_buffers = 16MB
max_connections = 100
\`\`\`

## 7. PHP Optimization (if applicable)

\`\`\`bash
sudo nano /etc/php/*/fpm/php.ini
\`\`\`

\`\`\`ini
memory_limit = 256M
max_execution_time = 30
opcache.enable = 1
opcache.memory_consumption = 128
opcache.interned_strings_buffer = 16
opcache.max_accelerated_files = 10000
opcache.validate_timestamps = 0       # Disable in production (requires restart on code change)
\`\`\`

## 8. Monitoring and Benchmarking

### Install monitoring tools:

\`\`\`bash
# Real-time monitoring
sudo apt install htop iotop iftop nethogs -y

# Disk performance
sudo apt install fio -y
fio --randwrite --ioengine=libaio --direct=1 --name=test --bs=4k --size=1G --numjobs=1 --runtime=60

# Network speed
curl -s https://raw.githubusercontent.com/sivel/speedtest-cli/master/speedtest.py | python3 -

# Web server benchmark
sudo apt install apache2-utils -y
ab -n 1000 -c 10 https://yoursite.com/
\`\`\`

## 9. Automated Performance Script

Save this as \`perf-check.sh\`:

\`\`\`bash
#!/bin/bash
echo "=== CPU ===" && top -bn1 | grep "Cpu(s)"
echo "=== Memory ===" && free -h
echo "=== Disk ===" && df -h /
echo "=== Load ===" && uptime
echo "=== Top Processes ===" && ps aux --sort=-%mem | head -5
echo "=== Network Connections ===" && ss -s
\`\`\`

\`\`\`bash
chmod +x perf-check.sh && ./perf-check.sh
\`\`\`

## 10. When to Upgrade

Upgrade your plan when:
- CPU consistently stays above 80%
- RAM usage is above 85% at peak
- Swap is being used regularly
- Disk I/O wait times exceed 100ms
- Network bandwidth hits your plan's cap

Contact CynexCloud support to discuss scaling options tailored to your workload.`
  },
  {
    slug: "deploying-your-first-bot",
    title: "Deploying Your First Discord Bot",
    excerpt: "Get your Discord bot online in minutes with our deployment guide.",
    categorySlug: "discord-bots",
    categoryName: "Discord Bots",
    content: `This guide walks you through deploying your first Discord bot on CynexCloud, from setup to going live.

## Prerequisites

- A CynexCloud Discord Bot hosting plan
- A Discord application created on the Discord Developer Portal
- Basic knowledge of JavaScript or Python (optional)

## Step 1: Create a Discord Application

1. Visit the Discord Developer Portal
2. Click **New Application** and give it a name
3. Go to the **Bot** section in the left sidebar
4. Click **Reset Token** and copy the token (save this securely — never share it!)

### Enable Privileged Intents

In the Bot section, enable:
- **Presence Intent** — if your bot tracks online status
- **Server Members Intent** — if your bot manages members
- **Message Content Intent** — if your bot reads message content (required for most command bots)

## Step 2: Invite Your Bot to a Server

1. Go to the **OAuth2 > URL Generator** section
2. Select **bot** under Scopes
3. Select permissions your bot needs:
   - **Send Messages**
   - **Read Message History**
   - **Manage Messages** (if it needs to delete messages)
   - **Connect** and **Speak** (for voice bots)
4. Copy the generated URL and open it in your browser
5. Select a server and authorize the bot

## Step 3: Set Up Your Bot on CynexCloud

1. Log into your CynexCloud dashboard
2. Go to **Services** and select your Discord Bot service
3. Click **Manage in Panel** to open the management panel

### Upload Your Bot Files

1. In the file manager, navigate to the bot directory
2. Upload your bot files (at minimum, a bot script and configuration files)
3. For JavaScript bots, ensure \`package.json\` and \`node_modules\` are present
4. For Python bots, ensure \`requirements.txt\` is present

### Set Environment Variables

In the **Startup** tab, set your environment variables:

\`\`\`
BOT_TOKEN=your_discord_bot_token_here
CLIENT_ID=your_application_id
GUILD_ID=your_server_id (for slash commands)
\`\`\`

## Step 4: Configure the Startup Command

### For Node.js bots (discord.js):

\`\`\`bash
node index.js
\`\`\`

### For Python bots (discord.py):

\`\`\`bash
python bot.py
\`\`\`

### For Java bots (JDA):

\`\`\`bash
java -jar bot.jar
\`\`\`

Set the startup command in the **Startup** tab of the management panel.

## Step 5: Start Your Bot

1. Go to the **Console** tab
2. Click **Start**
3. Watch the console logs for any errors
4. If successful, you'll see "Bot is online!" or similar message

## Example Bot (discord.js)

Here's a minimal bot to get started:

\`\`\`javascript
const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ]
});

client.once('ready', () => {
  console.log('Bot is online!');
});

client.on('messageCreate', (message) => {
  if (message.content === '!ping') {
    message.reply('Pong!');
  }
});

client.login(process.env.BOT_TOKEN);
\`\`\`

## Example Bot (discord.py)

\`\`\`python
import discord
from discord.ext import commands

intents = discord.Intents.default()
intents.message_content = True

bot = commands.Bot(command_prefix='!', intents=intents)

@bot.event
async def on_ready():
    print(f'Bot is online as {bot.user}')

@bot.command()
async def ping(ctx):
    await ctx.send('Pong!')

bot.run(os.getenv('BOT_TOKEN'))
\`\`\`

## Troubleshooting

**Bot won't start:** Check the console logs. Common issues include:
- Missing \`node_modules\` — run \`npm install\` in the file manager
- Missing Python dependencies — run \`pip install -r requirements.txt\`
- Invalid bot token — verify the token in environment variables

**Bot comes online but doesn't respond:** Verify:
- The bot has the correct intents enabled
- Your bot has permission to read and send messages in the channel
- Command prefixes match

## Need More Help?

Visit our support section in the CynexCloud dashboard for assistance. We also have pre-built bot templates available on request.`
  },
  {
    slug: "common-bot-errors",
    title: "Common Discord Bot Errors and How to Fix Them",
    excerpt: "Troubleshooting frequent issues with Discord bot hosting.",
    categorySlug: "discord-bots",
    categoryName: "Discord Bots",
    content: `Encountering errors with your Discord bot? This guide covers the most common issues and their solutions.

## 1. "Privileged Intent" Errors

**Error:** \`DiscordAPIError: Privileged intent provided is not enabled or approved\`

**Cause:** Your bot is using Gateway Intents that aren't enabled in the Discord Developer Portal.

**Fix:**
1. Go to the Discord Developer Portal
2. Select your application
3. Go to **Bot > Privileged Gateway Intents**
4. Enable the required intents:
   - **Message Content Intent** — if your bot reads message content
   - **Server Members Intent** — for member tracking features
   - **Presence Intent** — for online status features
5. Click **Save** and restart your bot

## 2. "Missing Permissions" Error

**Error:** \`DiscordAPIError: Missing Permissions\`

**Cause:** The bot doesn't have the required permissions in the server or channel.

**Fix:**
1. Right-click your server name → **Server Settings**
2. Go to **Roles** and find your bot's role
3. Enable the required permissions
4. Ensure the bot's role is positioned above any roles it needs to manage

For voice channels, the bot needs **Connect** and **Speak** permissions specifically.

## 3. "Token Invalid" Error

**Error:** \`DiscordAPIError: Invalid token\` or \`Error: An invalid token was provided\`

**Cause:** Wrong or expired bot token.

**Fix:**
1. Go to Discord Developer Portal → Your Application → Bot
2. Click **Reset Token**
3. Copy the new token
4. Update it in your bot's environment variables
5. Restart the bot

**Never share your token** — anyone with your token can control your bot.

## 4. Bot Not Responding to Commands

**Symptoms:** Bot shows online but doesn't reply.

### Check Command Registration:

For slash commands:
\`\`\`javascript
// Run this once to register commands
const { REST, Routes } = require('discord.js');
const rest = new REST().setToken(process.env.BOT_TOKEN);

const commands = [
  {
    name: 'ping',
    description: 'Replies with pong!',
  },
];

(async () => {
  try {
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands },
    );
    console.log('Commands registered');
  } catch (error) {
    console.error(error);
  }
})();
\`\`\`

### Verify Intents:

Ensure your code requests the correct intents:

\`\`\`javascript
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent, // Required for message content
  ]
});
\`\`\`

## 5. Rate Limiting (Too Many Requests)

**Error:** \`DiscordAPIError: 429 Too Many Requests\`

**Cause:** Your bot is sending too many requests to Discord's API.

**Fix:**
- Add delays between bulk operations
- Use \`setTimeout()\` or \`await\` to space out requests
- Consider using a queue system for API calls

\`\`\`javascript
// Example: Rate limit safe message sending
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function safeSend(channel, messages) {
  for (const msg of messages) {
    await channel.send(msg);
    await delay(1000); // 1 second delay between messages
  }
}
\`\`\`

## 6. "Cannot Find Module" or Import Errors

**Error:** \`Error: Cannot find module 'discord.js'\`

**Cause:** Node modules are missing or not installed.

**Fix:**
\`\`\`bash
# In your bot directory
npm install
# Or for specific missing packages
npm install discord.js
\`\`\`

For Python bots:
\`\`\`bash
pip install -r requirements.txt
pip install discord.py
\`\`\`

## 7. Bot Keeps Going Offline

**Symptoms:** Bot crashes repeatedly or shows intermittent uptime.

### Check for unhandled promise rejections:

\`\`\`javascript
// Add to your bot's main file
process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
});
\`\`\`

### Implement auto-restart:

\`\`\`javascript
client.on('error', (error) => {
  console.error('Client error:', error);
  // Attempt to reconnect
  client.login(process.env.BOT_TOKEN);
});

client.on('shardError', (error) => {
  console.error('Shard error:', error);
});
\`\`\`

## 8. "Interaction Failed" Error

**Error:** \`InteractionFailed\` when using slash commands.

**Cause:** The bot took longer than 3 seconds to respond, or encountered an error during processing.

**Fix:**
- Use \`deferReply()\` for slow operations
- Wrap command handlers in try/catch blocks

\`\`\`javascript
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  try {
    await interaction.deferReply(); // Gives you 15 minutes instead of 3 seconds

    if (interaction.commandName === 'data') {
      const result = await fetchLargeDataset();
      await interaction.editReply('Data loaded: ' + result);
    }
  } catch (error) {
    console.error('Command error:', error);
    await interaction.editReply('An error occurred while processing your command.');
  }
});
\`\`\`

## 9. Memory Leaks

**Symptoms:** Bot uses increasing amounts of RAM over time, eventually crashes.

**Causes and fixes:**
- **Event listeners not removed** — ensure you're not adding listeners in command handlers
- **Cache not cleared** — \`client.users.cache.clear()\` periodically
- **Large collections** — limit cache sizes

\`\`\`javascript
// Limit guild member cache
const client = new Client({
  makeCache: (manager) => {
    if (manager.name === 'users') return new LimitedCollection({ maxSize: 1000 });
    if (manager.name === 'members') return new LimitedCollection({ maxSize: 100 });
    return new LimitedCollection({ maxSize: 500 });
  }
});
\`\`\`

## Quick Troubleshooting Checklist

- [ ] Bot token is correct and not expired
- [ ] Intents are enabled in Developer Portal
- [ ] Bot has proper role permissions
- [ ] Node dependencies are installed (for JS bots)
- [ ] Python packages are installed (for Python bots)
- [ ] Environment variables are set correctly
- [ ] Bot is not rate limited
- [ ] Console shows no error messages

## Still Stuck?

Contact CynexCloud support through your dashboard. Our team can review your bot's logs and help resolve the issue.`
  },
  {
    slug: "understanding-your-invoice",
    title: "Understanding Your Invoice",
    excerpt: "A breakdown of charges, taxes, and billing cycles.",
    categorySlug: "billing",
    categoryName: "Billing",
    content: `Understanding your CynexCloud invoice helps you track spending and plan your budget. Here's everything you need to know.

## Invoice Structure

Every invoice includes these key sections:

### Header Information
- **Invoice Number:** Unique identifier (e.g., INV-2024-00123)
- **Invoice Date:** When the invoice was generated
- **Due Date:** Payment deadline (typically 7 days from invoice date)
- **Status:** Paid, Unpaid, Overdue, or Cancelled

### Billing Details
- **Customer Name:** Your account name
- **Email:** Your account email
- **Billing Address:** Your registered address (if applicable)

### Line Items

Each service appears as a separate line item:

\`\`\`
Minecraft Server - Iron Plan     $14.99/mo    × 1    $14.99
Addon: Extra RAM (2GB)          $3.75/mo     × 1    $3.75
Addon: DDoS Shield              $3.00/mo     × 1    $3.00
----------------------------------------------------------
Subtotal                                                $21.74
\`\`\`

### Charges Breakdown

| Component | Description |
|-----------|-------------|
| Base Plan | Your plan's recurring price |
| Addons | Optional extras per service |
| Overages | Usage beyond plan limits |
| Credits | Discounts or promotional credits |
| Tax | Applicable VAT/sales tax |

## Billing Cycles

### Monthly Billing
- Charged on the same day each month
- Best for short-term projects or testing
- Slightly higher per-month cost

### Quarterly Billing
- Charged every 3 months
- Saves about 5% compared to monthly
- Good for established projects

### Semi-Annual Billing
- Charged every 6 months
- Saves about 10%
- Ideal for long-running services

### Annual Billing
- Charged once per year
- Best value — save about 15-20%
- Recommended for production services

## Pro-rated Charges

If you upgrade or downgrade mid-cycle, charges are pro-rated:

\`\`\`
Days remaining in cycle: 15
Total days in cycle: 30
Upgrade price difference: $10.00
Pro-rated charge: $10.00 × (15/30) = $5.00
\`\`\`

The pro-rated amount is added to your next invoice.

## Tax Information

Tax is calculated based on your location:

- **EU customers:** VAT at your country's rate (if applicable)
- **US customers:** Sales tax may apply depending on state
- **International customers:** Tax-exempt unless local regulations require it

To update your tax information, go to **Dashboard > Profile > Billing Address**.

## Payment Methods

CynexCloud accepts cryptocurrency payments via OxaPay:

- **Bitcoin (BTC)**
- **Ethereum (ETH)**
- **USDT (ERC-20 / TRC-20)**
- **150+ other cryptocurrencies**

## Overdue Invoices

If an invoice remains unpaid:
- **Day 1-3:** Payment reminder emails sent
- **Day 4-6:** Service suspension warning
- **Day 7:** Service is suspended (stopped but not deleted)
- **Day 14:** Service is terminated and may be deleted

To avoid service interruption, ensure your invoices are paid on time.

## Invoice Statuses

| Status | Meaning |
|--------|---------|
| **Paid** | Invoice has been paid in full |
| **Unpaid** | Awaiting payment |
| **Overdue** | Past the due date |
| **Cancelled** | Invoice voided (e.g., service cancelled before billing) |
| **Refunded** | Payment returned to you |

## Viewing Your Invoices

1. Log into your CynexCloud dashboard
2. Navigate to **Invoices** in the left sidebar
3. All invoices are listed with status and amount
4. Click any invoice to view details

## Need Help?

If you have questions about a specific charge or need to dispute an invoice, contact our billing team through the support section in your dashboard.`
  },
  {
    slug: "how-to-upgrade-your-plan",
    title: "How to Upgrade Your Plan",
    excerpt: "Easily switch to a higher tier plan from your dashboard.",
    categorySlug: "billing",
    categoryName: "Billing",
    content: `Upgrading your plan is simple and happens instantly. This guide covers the upgrade process for all service types.

## Before You Upgrade

Check if an upgrade is right for you:

- **CPU consistently above 80%:** Need more processing power
- **RAM usage above 85%:** Time for a memory upgrade
- **Disk space below 20%:** Consider more storage
- **Player slots full:** Needed for growing communities

## How to Upgrade

### Step 1: Access Your Service

1. Log into your CynexCloud dashboard
2. Click **Services** in the sidebar
3. Find the service you want to upgrade
4. Click on it to view details

### Step 2: Choose a New Plan

Currently, plan changes are handled through our support team:

1. Contact support through **Dashboard > Support**
2. Specify which service you want to upgrade
3. Tell us which plan you want to switch to
4. We'll handle the migration and pro-rate the pricing

We're working on a self-service upgrade feature that will be available soon.

## What Happens During an Upgrade

### For Minecraft Servers
- **No downtime** — we migrate your data while the server runs
- All worlds, plugins, and configs are preserved
- Server restarts automatically after migration
- IP address remains the same

### For VPS Plans
- Brief pause while resources are reallocated (about 30-60 seconds)
- All data, applications, and configurations remain intact
- IP address and SSH keys are preserved
- Running processes resume automatically

### For Discord Bots
- Bot is briefly taken offline during migration (1-2 minutes)
- Bot token and configuration remain unchanged
- Bot restarts automatically on the upgraded plan

## Pro-rated Pricing

When you upgrade mid-cycle, you only pay the difference:

\`\`\`
Example:
Current plan: Iron Plan - $14.99/month
New plan: Gold Plan - $29.99/month
Difference: $15.00/month

Days remaining: 20 out of 30
Pro-rated charge: $15.00 × (20/30) = $10.00
\`\`\`

## Downgrading

To downgrade your plan, also contact support. Note that:
- Downgrading may require removing data (e.g., world files) to fit in the new plan's storage
- You must manually back up any data that exceeds the new plan limits
- Downgrade credits are applied to your account balance

## Plan Comparison

### Minecraft Hosting

| Plan | vCPU | RAM | Storage | Players | Price |
|------|------|-----|---------|---------|-------|
| Iron | 2 | 4GB | 40GB | 20 | $14.99 |
| Gold | 4 | 8GB | 80GB | 50 | $29.99 |
| Diamond | 6 | 12GB | 120GB | 100 | $49.99 |

### VPS Hosting

| Plan | vCPU | RAM | Storage | Bandwidth | Price |
|------|------|-----|---------|-----------|-------|
| Starter | 1 | 2GB | 40GB | 2TB | $9.99 |
| Business | 2 | 4GB | 80GB | 4TB | $19.99 |
| Enterprise | 4 | 8GB | 160GB | 8TB | $39.99 |

### Discord Bot Hosting

| Plan | vCPU | RAM | Storage | Servers | Price |
|------|------|-----|---------|---------|-------|
| Basic | 1 | 1GB | 5GB | 5 | $4.99 |
| Advanced | 2 | 2GB | 10GB | 25 | $9.99 |
| Ultimate | 4 | 4GB | 20GB | 100 | $19.99 |

## Need Help Choosing?

Not sure which plan is right for you? Contact our sales team through the dashboard. We'll help you find the perfect plan based on your requirements.`
  },
  {
    slug: "creating-your-account",
    title: "Creating Your CynexCloud Account",
    excerpt: "Sign up and verify your email to get started.",
    categorySlug: "getting-started",
    categoryName: "Getting Started",
    content: `Welcome to CynexCloud! This guide walks you through creating your account and getting started with our services.

## Step 1: Create Your Account

1. Visit the CynexCloud website
2. Click **Get Started** or navigate to the **Register** page
3. Fill in the registration form:

\`\`\`
Username: Choose a unique username (3-16 characters)
Email: Use a valid email address
Password: At least 8 characters with uppercase, lowercase, and numbers
Confirm Password: Re-enter your password
\`\`\`

4. Agree to our Terms of Service and Privacy Policy
5. Click **Create Account**

## Step 2: Verify Your Email

After registration, you'll receive a verification email:

1. Check your inbox (and spam folder) for an email from CynexCloud
2. Click the **Verify Email** button in the email
3. You'll be redirected to the CynexCloud website confirming verification
4. Log in with your credentials

Didn't receive the email? You can request a new verification email from the login page.

## Step 3: Log In

1. Go to the **Login** page
2. Enter your email and password
3. Click **Sign In**

Alternatively, you can log in with Discord if social login is enabled.

## Step 4: Set Up Your Profile

1. Navigate to **Dashboard > Profile**
2. Add additional details:
   - **Display Name** — how your name appears
   - **Avatar** — upload a profile picture
   - **Language** — select your preferred language
   - **Timezone** — set your local timezone

## Step 5: Enable Two-Factor Authentication (Recommended)

1. Go to **Dashboard > Security**
2. Click **Enable Two-Factor Authentication**
3. Scan the QR code with an authenticator app (Google Authenticator, Authy, etc.)
4. Enter the verification code from your app
5. Save your backup codes in a secure location

## Step 6: Deploy Your First Service

Now you're ready to deploy:

- **Minecraft Server:** Browse Minecraft plans, choose your tier, and deploy
- **VPS:** Select a VPS plan and configure your virtual server
- **Discord Bot:** Deploy a bot in minutes with our optimized hosting

Check our other guides for detailed deployment instructions.

## Account Features

| Feature | Description |
|---------|-------------|
| **Dashboard** | Central hub for managing all services |
| **Services** | View and manage your active services |
| **Invoices** | Track billing and payment history |
| **Support** | Create and manage support tickets |
| **API Keys** | Generate API keys for programmatic access |
| **Announcements** | Stay updated with platform news |

## Tips for New Users

- **Start small** — choose a basic plan and upgrade as you grow
- **Add funds** — pre-fund your account for automatic renewals
- **Join our community** — follow us for updates and tips
- **Read the docs** — our knowledge base is full of helpful guides
- **Contact support** — we're here to help 24/7

## Need Help?

If you run into any issues during registration, contact our support team through:
- **Dashboard > Support** — create a support ticket
- We typically respond within a few hours

Welcome to CynexCloud!`
  },
  {
    slug: "your-first-server-deployment",
    title: "Your First Server Deployment",
    excerpt: "From plan selection to server online in under 60 seconds.",
    categorySlug: "getting-started",
    categoryName: "Getting Started",
    content: `Deploying your first server on CynexCloud is quick and easy. Follow this guide to go from plan selection to a running server in minutes.

## Step 1: Choose Your Service

Browse our service categories on the website:

- **Minecraft Hosting** — optimized game servers with mod/plugin support
- **VPS Hosting** — full Linux virtual machines with root access
- **Discord Bot Hosting** — pre-configured bot hosting with easy management

Click on **Select Category** or navigate directly to the service you want.

## Step 2: Select a Plan

Each service has multiple tiers. Consider these factors when choosing:

\`\`\`
For Minecraft:
- Iron Plan: 2 vCPU, 4GB RAM, 40GB SSD — up to 20 players
- Gold Plan: 4 vCPU, 8GB RAM, 80GB SSD — up to 50 players
- Diamond Plan: 6 vCPU, 12GB RAM, 120GB SSD — up to 100 players

For VPS:
- Starter: 1 vCPU, 2GB RAM, 40GB SSD — basic websites
- Business: 2 vCPU, 4GB RAM, 80GB SSD — applications
- Enterprise: 4 vCPU, 8GB RAM, 160GB SSD — high-traffic

For Discord Bots:
- Basic: 1 vCPU, 1GB RAM, 5GB SSD — single server bot
- Advanced: 2 vCPU, 2GB RAM, 10GB SSD — multi-server bot
- Ultimate: 4 vCPU, 4GB RAM, 20GB SSD — large bot with AI
\`\`\`

## Step 3: Configure Addons

Enhance your plan with optional addons:

| Addon | Description | Price |
|-------|-------------|-------|
| Extra RAM | +25% additional memory | % of plan price |
| Extra Storage | +15% additional SSD space | % of plan price |
| +100% CPU | Double CPU allocation | % of plan price |
| DDoS Shield | Advanced DDoS protection (up to 1.5 Tbps) | % of plan price |
| Priority Support | 24/7 priority ticket response | % of plan price |
| Automatic Backups | Daily automated backups with 7-day retention | % of plan price |

## Step 4: Choose Your Location

Select a node location closest to your target audience:

\`\`\`
- New York, USA
- London, UK
- Frankfurt, Germany
- Singapore
- Sydney, Australia
\`\`\\)

Lower latency means better performance for your users.

## Step 5: Configure Your Server

### For Minecraft:
- **Server Name:** A memorable name for your server
- **Software:** Paper, Forge, Vanilla, Purpur, Fabric, Velocity, BungeeCord
- **Version:** Select your preferred Minecraft version
- **Additional Options:** Enable/disable features as needed

### For VPS:
- **Operating System:** Ubuntu, Debian, CentOS, AlmaLinux
- **Hostname:** Your server's hostname

### For Discord Bots:
- **Bot Name:** A name to identify your bot
- **Language:** Node.js or Python

## Step 6: Review and Deploy

1. Review your order summary showing:
   - Selected plan and pricing
   - Addons and their costs
   - Billing cycle (monthly, quarterly, semi-annual, annual)
   - Total due today

2. Agree to the Terms & Conditions
3. Click **Deploy Server**

## Step 7: Complete Payment

1. You'll be redirected to the payment page
2. Choose your cryptocurrency (BTC, ETH, USDT, or other)
3. Complete the payment via OxaPay
4. Your server will deploy automatically upon payment confirmation

## Step 8: Access Your Server

Once payment is confirmed (usually within 1-2 minutes):

1. Go to **Dashboard > Services**
2. You'll see your new service listed
3. Click on it to view details including:
   - Server IP address and port
   - Pterodactyl panel access link
   - Resource usage
   - Billing information

## Managing Your Server

### Via Pterodactyl Panel:
- Full console access
- File management (upload, download, edit)
- Startup configuration
- Backup management

### Via CynexCloud Dashboard:
- View resource usage
- Manage billing and invoices
- Create support tickets
- View announcements

## Next Steps

Now that your server is running:

- **Minecraft:** Install plugins or mods, set up permissions, invite players
- **VPS:** SSH in, install your applications, configure your stack
- **Discord Bot:** Upload your bot code, set environment variables, go live

## Troubleshooting

**Server not showing up?** Check your invoices — payment must be confirmed before deployment.

**Server won't start?** Check the Pterodactyl console for error logs. Common fixes include accepting the EULA (Minecraft) or ensuring correct startup command.

Need help? Contact support through your dashboard.`
  },
  {
    slug: "what-payment-methods-do-you-accept",
    title: "What Payment Methods Do You Accept?",
    excerpt: "We accept Bitcoin, USDT, ETH, and 150+ cryptocurrencies via OxaPay.",
    categorySlug: "faq",
    categoryName: "FAQ",
    content: `## Accepted Payment Methods

CynexCloud accepts payments exclusively through cryptocurrency via **OxaPay**, our payment processing partner.

### Supported Cryptocurrencies

We accept 150+ cryptocurrencies including:

| Currency | Network | Notes |
|----------|---------|-------|
| **Bitcoin (BTC)** | Native | Most widely accepted |
| **Ethereum (ETH)** | ERC-20 | Fast confirmation |
| **USDT** | ERC-20 / TRC-20 / BEP-20 | Stable value, choose your network |
| **USDC** | ERC-20 / TRC-20 / BEP-20 | Stablecoin alternative |
| **Litecoin (LTC)** | Native | Low fees, fast |
| **Solana (SOL)** | Native | Very fast, low fees |
| **Binance Coin (BNB)** | BEP-20 / BEP-2 | |

A full list is displayed at checkout when you select "Pay with Crypto."

### Why Crypto Only?

Cryptocurrency payments allow us to:
- Offer competitive pricing without chargeback fees (typically 3-5% for credit cards)
- Process payments instantly 24/7/365
- Support customers globally without banking restrictions
- Provide greater privacy and security

## How to Pay

1. At checkout, select **OxaPay Crypto**
2. Choose your preferred cryptocurrency
3. A payment QR code and wallet address will be displayed
4. Send the exact amount shown (including network fee)
5. Payment is confirmed within 1-10 minutes depending on network congestion

## Payment Processing Times

| Currency | Typical Confirmation Time |
|----------|-------------------------|
| BTC | 10-30 minutes |
| ETH | 2-5 minutes |
| USDT (TRC-20) | 1-3 minutes |
| LTC | 5-10 minutes |
| SOL | 10-30 seconds |

Your service is deployed immediately once the transaction has the required number of confirmations.

## Pricing in Crypto

All prices on CynexCloud are displayed in USD. When you pay with crypto, the USD amount is converted to the equivalent in your chosen cryptocurrency at the current market rate, which is locked in for 15 minutes to allow for payment.

## Refunds

Refunds are issued in the same cryptocurrency used for payment, at the current market rate. Our 7-day money-back guarantee applies to all plans.

## Frequently Asked Questions

**Q: Can I use PayPal or credit card?**
A: Currently, we only accept cryptocurrency payments. This helps us keep our prices lower and avoid chargeback fees.

**Q: What if I overpay?**
A: Any overpayment beyond the invoice amount is automatically credited to your account balance and can be used toward future invoices.

**Q: What if I underpay?**
A: Your payment will be credited to your account, but the invoice will remain unpaid until the full amount is covered.

**Q: Is there a minimum payment amount?**
A: The minimum payment is equivalent to $5 USD to account for network transaction fees.
`
  },
  {
    slug: "how-long-does-provisioning-take",
    title: "How Long Does Provisioning Take?",
    excerpt: "Servers are deployed automatically within seconds of payment confirmation.",
    categorySlug: "faq",
    categoryName: "FAQ",
    content: `## Instant Deployment

CynexCloud uses fully automated provisioning. Once your payment is confirmed, your server is deployed automatically — no manual intervention needed.

### Typical Timeline

\`\`\`
Payment Sent → Network Confirmation → Deployment → Ready
     ↓                 ↓                  ↓           ↓
   0 min             1-10 min           <30 sec    <11 min total
\`\`\`

### By Cryptocurrency

| Currency | Payment Confirm | Deploy Time | Total Time |
|----------|----------------|-------------|------------|
| **Solana (SOL)** | 10-30 seconds | ~15 seconds | ~45 seconds |
| **USDT (TRC-20)** | 1-3 minutes | ~15 seconds | 1-4 minutes |
| **Litecoin (LTC)** | 5-10 minutes | ~15 seconds | 5-11 minutes |
| **Ethereum (ETH)** | 2-5 minutes | ~15 seconds | 2-6 minutes |
| **Bitcoin (BTC)** | 10-30 minutes | ~15 seconds | 10-31 minutes |
| **Binance Coin (BNB)** | 1-3 minutes | ~15 seconds | 1-4 minutes |

## What Happens During Deployment

1. **Payment confirmed** — OxaPay notifies our system
2. **Order processed** — our system creates the service
3. **Server provisioned** — the Pterodactyl panel creates your server with the selected resources
4. **Configuration applied** — software, version, and settings are configured
5. **Server started** — the server boots up for the first time
6. **Access granted** — the service appears in your dashboard with connection details

## Why Is My Server Not Ready Yet?

### Payment Still Confirming
Check the transaction on the blockchain explorer. Most delays are due to network congestion.

### First-Time Setup
Some software requires first-time setup:
- **Minecraft:** Generating the world can take 1-2 minutes on first start
- **VPS:** OS image installation takes 1-3 minutes
- **Discord Bot:** Bot starts immediately once configured

### Issues That May Cause Delays

- **Insufficient payment** — the exact amount must be paid
- **Network congestion** — blockchain is busy, confirmations take longer
- **Resource availability** — extremely rare, but node capacity may temporarily be exhausted

## What to Do If It's Taking Too Long

1. **Check your invoice** — go to Dashboard > Invoices and verify payment status
2. **Check the transaction** — use a blockchain explorer with your transaction ID
3. **Refresh your dashboard** — sometimes the UI just needs a refresh
4. **Contact support** — if it's been more than 1 hour, create a support ticket

## Real-Time Status

You can check your order status at any time:
1. Go to **Dashboard > Services**
2. New services will appear automatically once deployed
3. Refresh the page to see the latest status

## Need Faster Deployment?

Choose cryptocurrencies with faster confirmation times:
- **Solana (SOL)** — fastest at ~10 seconds
- **USDT (TRC-20)** — very fast at ~1 minute
- **BNB (BEP-20)** — fast at ~1 minute

Avoid Bitcoin during high network congestion periods for quicker deployments.`
  },
  {
    slug: "can-i-get-a-refund",
    title: "Refund Policy — 7-Day Money-Back Guarantee",
    excerpt: "Yes, we offer a 7-day money-back guarantee on all plans.",
    categorySlug: "faq",
    categoryName: "FAQ",
    content: `## 7-Day Money-Back Guarantee

We stand behind our services. If you're not satisfied within the first **7 days** of your initial purchase, we'll issue a full refund — no questions asked.

## Refund Eligibility

### Eligible for Full Refund
- First-time purchase of any plan
- Within 7 days of the original purchase date
- Service must not have violated our Terms of Service

### Not Eligible for Refund
- Renewal payments (after the initial 7-day period)
- Addon purchases (refunded only with the base plan within the 7-day window)
- Services terminated due to Terms of Service violations
- Refund requests beyond 7 days (pro-rated credit may be offered)

## How to Request a Refund

1. Log in to your CynexCloud dashboard
2. Navigate to **Support** and click **Create Ticket**
3. Select the subject **Billing Issue**
4. Include in your message:
   - Your service name/ID
   - Invoice number
   - Reason for the refund request
5. Submit the ticket

Our billing team will process your request within 24 hours.

### Faster Refund Processing

To speed things up, please include:
- Your order/invoice number
- The cryptocurrency wallet address for the refund
- The cryptocurrency network (BTC, ERC-20, TRC-20, etc.)

## Refund Processing Time

| Payment Method | Processing Time |
|----------------|----------------|
| Bitcoin (BTC) | 1-2 business days |
| Ethereum (ETH) | 1-2 business days |
| USDT (TRC-20) | 1 business day |
| Other crypto | 1-3 business days |

Refunds are issued in the same cryptocurrency used for the original payment, at the current market rate.

## Partial Refunds

In some cases, we may offer a partial refund:
- **Service downgrade** — the difference is credited to your account
- **Mid-cycle cancellation** — pro-rated refund for remaining days (minus a small processing fee)

## Account Credits

Instead of a refund, you may choose an **account credit**:
- 110% of the refund amount credited to your account
- Can be used toward any CynexCloud service
- No expiration date

## Chargebacks

If you file a chargeback with your bank or payment provider:
- Your services will be immediately suspended
- Your account will be locked pending investigation
- You may lose access to all data and services
- Future service with CynexCloud may be denied

Please contact us first — we'll always work with you to resolve any issues.

## Exceptions

We may make exceptions to this policy in special circumstances, including:
- Extended service outages due to our infrastructure
- Billing errors on our part
- Other exceptional situations evaluated on a case-by-case basis

## Questions?

Contact our billing support team through the dashboard if you have any questions about our refund policy before making a purchase.`
  },
]
