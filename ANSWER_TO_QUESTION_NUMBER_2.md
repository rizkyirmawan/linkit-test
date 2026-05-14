# 1. Check Service Status

Verify if the web service is actually running.

```bash
# Check if service is running (systemd)
sudo systemctl status nginx
sudo systemctl status apache2
sudo systemctl status httpd

# Check if service is running (init.d)
sudo service nginx status
sudo service apache2 status

# Check if process is running
ps aux | grep nginx
ps aux | grep apache

# Check for specific port processes
lsof -i :80
lsof -i :443
```

**Why:** Confirm the web server process is alive. If stopped, start it with `sudo systemctl start nginx`.

---

# 2. Check Ports

Verify the web server is listening on expected ports.

```bash
# List all listening ports
sudo netstat -tlnp
sudo ss -tlnp

# Check specific port
sudo netstat -tlnp | grep :80
sudo ss -tlnp | grep :80

# Check if port is open from outside
nc -zv yourdomain.com 80
telnet yourdomain.com 80
```

**Why:** Ensure the service is bound to the correct interface (0.0.0.0 vs 127.0.0.1). Check if another process is using port 80.

---

# 3. Check System Resources

Verify server has enough CPU, memory, and I/O capacity.

```bash
# CPU and load average
top
uptime
htop

# Memory usage
free -h
vmstat 1

# Disk space and I/O
df -h
iostat -x 1 5

# Check for OOM killer (Out of Memory)
dmesg | grep -i "out of memory"
dmesg | grep -i "killed process"
```

**Why:** High load, memory exhaustion, or disk full can cause timeouts. OOM killer may have terminated the service.

---

# 4. Check Logs

Analyze application and system logs for errors.

```bash
# Web server error logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/apache2/error.log

# Access logs (recent requests)
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/apache2/access.log

# System logs
sudo journalctl -u nginx --since "10 minutes ago"
sudo journalctl -xe --no-pager

# Application logs (if applicable)
sudo tail -f /var/log/myapp.log
```

**Why:** Logs reveal the exact error - 500 errors, permission denied, upstream failures, etc.

---

# 5. Check Reverse Proxy / Load Balancer

If using Nginx as reverse proxy, verify upstream connectivity.

```bash
# Test upstream connectivity
curl -v http://localhost:8080
curl -v http://127.0.0.1:3000

# Check nginx configuration
sudo nginx -t

# Reload nginx after config changes
sudo systemctl reload nginx

# Check upstream status in config
cat /etc/nginx/conf.d/upstream.conf
```

**Why:** The proxy may be unable to reach the application backend. Test directly to isolate the issue.

---

# 6. Check Firewall / Network Issues

Verify network connectivity and firewall rules.

```bash
# Check if port is allowed in firewall
sudo iptables -L -n
sudo ufw status
sudo firewall-cmd --list-all

# Test local connectivity
curl -v http://localhost
ping yourdomain.com
traceroute yourdomain.com

# Check DNS resolution
nslookup yourdomain.com
dig yourdomain.com

# Check network interfaces
ip addr
netstat -i
```

**Why:** Firewall may be blocking requests, DNS may be misconfigured, or network routes may be broken.

---

# 7. Check Database Connectivity

If the app depends on a database, verify connectivity.

```bash
# Test MySQL/MariaDB connection
mysql -u username -p -h localhost -e "SELECT 1"
mysqladmin -u username -p ping

# Test PostgreSQL connection
psql -U username -h localhost -c "SELECT 1"
pg_isready -h localhost

# Check database from application
# For PHP: php -m | grep mysql
# For Node: node -e "require('mysql').createConnection(...)"

# Check database processes
SHOW PROCESSLIST;  # MySQL
SELECT * FROM pg_stat_activity;  # PostgreSQL
```

**Why:** Database timeout can cause the entire app to hang. The app may be waiting for DB response.

---

# Quick Diagnostic Flow

```
1. systemctl status nginx           → Is service running?
2. netstat -tlnp | grep :80         → Is port listening?
3. top / free -h                    → Resources OK?
4. tail /var/log/nginx/error.log    → Any errors?
5. curl localhost                   → Does it work locally?
6. iptables -L                      → Firewall blocking?
7. Test DB connection               → Database reachable?
```

---

# Common Causes and Fixes

| Symptom                | Possible Cause            | Fix                         |
| ---------------------- | ------------------------- | --------------------------- |
| Connection refused     | Service not running       | `systemctl start nginx`     |
| 504 Gateway Timeout    | Upstream app slow/down    | Check app, increase timeout |
| 502 Bad Gateway        | Proxy can't reach backend | Check upstream, restart app |
| No response, high load | Server overloaded         | Scale up, optimize queries  |
| Connection timeout     | Firewall blocking         | Open port in firewall       |
| Slow response          | Database bottleneck       | Optimize queries, add index |
| 500 Internal Error     | Code/app crash            | Check error logs            |
