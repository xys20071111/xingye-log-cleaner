import * as yaml from "@std/yaml"

const decoder = new TextDecoder()
const encoder = new TextEncoder()
const file = await Deno.readFile(Deno.args[0])
const rawText = decoder.decode(file)
const text = rawText.replaceAll('*', "ABCABC")
const lines = text.split('\n')

const user: Array<string> = []
const assistant: Array<string> = []
const log: Array<{
  role: 'user' | 'assistant'
  text: string
}> = []

for (const line of lines) {
  if (line.startsWith('{')) {
    const dataObject: {
      command: string
      payload?: {
        status?: any
        metas?: Array<{
          payload: {
            chattype: string
            contents: Array<{
              customexts: Array<{
                key: string
                value: string
              }>
            }>
          }
        }>
        meta?: {
          payload?: {
            chattype?: string
            contents: Array<{
              text: string
            }>
            exts: Array<any>
          }
        }
      }
    } = yaml.parse(line) as any
    if (dataObject.command === 'SYNC' && dataObject.payload?.meta?.payload?.chattype === 'CHAT') {
      user.push(dataObject.payload.meta.payload.contents[0].text.replaceAll('ABCABC', '*'))
    }
    if (dataObject.command === 'SYNC' && dataObject.payload?.status && dataObject.payload?.metas && dataObject.payload?.metas[0].payload.chattype === 'CHAT') {
      assistant.push(dataObject.payload.metas[0].payload.contents[0].customexts[1].value.replaceAll('ABCABC', '*'))
    }
  }
}

for (let i = 0; i < user.length; i++) {
  log.push({
    role: 'user',
    text: user[i]
  })
  log.push({
    role: 'assistant',
    text: assistant[i]
  })
}

const logJson = JSON.stringify(log, null, 4)
Deno.writeFile(Deno.args[1] || 'export.json', encoder.encode(logJson))