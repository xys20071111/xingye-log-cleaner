# 星野聊天日志导出
原理：解析星野的日志文件  
### 使用方法(以国际版为例，国内版自行调整参数)
1: 将 `/storage/emulated/0/Android/data/com.weaver.app.prod/${uid}\#talkie/core_log/easemob.log` 发送到电脑  
2: 运行 `deno run --allow-read --allow-write main.ts 日志文件 保存文件名.json`