# 星野聊天日志导出
原理：解析星野的日志文件  
### 应用日志解析版使用方法(以国际版为例，国内版自行调整参数)
1: 将 `/storage/emulated/0/Android/data/com.weaver.app.prod/${uid}\#talkie/core_log/easemob.log` 发送到电脑  
2: 运行 `deno run --allow-read --allow-write app_log_parser.ts --input 日志文件 --output 保存文件名.json`

### 网页版使用方法
 将 `web_log_exporter.js` 里的内容粘贴到控制台，会自动开始下载

### 程序参数
`--input` 输入的日志文件  
`--output` 保存的文件名  
`--system` 提示词文件，将作为提示词附加到文件中  