# 🚀 Quick Start Guide - Smart Port Management

## 🎯 **Daily Usage (Just 2 Commands!)**

### **Start Everything:**
```bash
./scripts/smart-start.sh
```

### **Stop Everything:**
```bash
./scripts/smart-stop.sh
```

**That's it! No more port conflicts, no more manual cleanup.** 🎉

---

## 🔍 **When You Need More Control**

### **Check Server Status:**
```bash
./scripts/smart-stop.sh status
```

### **Restart Everything:**
```bash
./scripts/smart-stop.sh restart
```

### **Check Port Status:**
```bash
./scripts/port-manager.sh check
```

### **Clean All Processes:**
```bash
./scripts/port-manager.sh clean
```

---

## 🚨 **If Something Goes Wrong**

### **Port Still Busy?**
```bash
./scripts/port-manager.sh clean
./scripts/smart-start.sh
```

### **Server Won't Start?**
```bash
./scripts/smart-stop.sh
./scripts/smart-start.sh
```

### **Check Logs:**
```bash
cat logs/backend.log
cat logs/frontend.log
```

---

## 🌐 **Access Your System**

- **Main Website**: http://localhost:4000
- **Admin Panel**: http://localhost:4000/sector_xp_12
- **Backend API**: http://localhost:4001
- **Admin Login**: Lone_wolf#12:Apx_gp_delta

---

## 💡 **Pro Tips**

1. **Always use the smart scripts** instead of `npm run dev`
2. **Check status first** if you're unsure what's running
3. **Use restart** if you want a fresh start
4. **Check logs** if something isn't working

---

## 🎉 **You're All Set!**

The port conflict nightmare is over. Your servers will start reliably every time! 🚀
