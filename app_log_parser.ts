import * as yaml from "@std/yaml"
import { parseArgs } from '@std/cli'

interface IData {
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
}

const decoder = new TextDecoder()
const encoder = new TextEncoder()

const args = parseArgs(Deno.args)

const file = await Deno.readFile(args['input'])
const rawText = decoder.decode(file)
const text = rawText.replaceAll('*', "ABCABC")
const lines = text.split('\n')

const user: Array<string> = []
const assistant: Array<string> = []

const system = args['system'] ? decoder.decode(await Deno.readFile(args['system'])) : null

const log: Array<{
  role: 'user' | 'assistant' | 'system'
  text: string
}> = []

if (system) {
  log.push({
    role: 'system',
    text: system
  })
}

for (const i in lines) {
  let lineNumber = parseInt(i, 10)
  if (lines[lineNumber].startsWith('{')) {
    let dataObject: IData
    try {
      dataObject = yaml.parse(lines[i]) as any
    } catch {
      let dataString = lines[lineNumber]
      let j = 1
      while (true) {
        try {
          dataObject = yaml.parse(dataString) as any
          break
        } catch {
          dataString += lines[lineNumber + j]
          j++
        }
      }
    }
    if (dataObject.command === 'SYNC' && dataObject.payload?.meta?.payload?.chattype === 'CHAT') {
      user.push(dataObject.payload.meta.payload.contents[0].text.replaceAll('ABCABC', '*'))
    }
    if (dataObject.command === 'SYNC' && dataObject.payload?.status && dataObject.payload?.metas && dataObject.payload?.metas[0].payload.chattype === 'CHAT' && dataObject.payload.metas[0].payload.contents[0]?.customexts && dataObject.payload.metas[0].payload.contents[0]?.customexts.length === 3) {
      assistant.push(dataObject.payload.metas[0].payload.contents[0].customexts[1].value.replaceAll('ABCABC', '*'))
    }
    if (dataObject.command === 'SYNC' && dataObject.payload?.status && dataObject.payload?.metas && dataObject.payload?.metas[0].payload.chattype === 'EDIT' && dataObject.payload.metas[0].payload.contents[0]?.customexts && dataObject.payload.metas[0].payload.contents[0]?.customexts.length === 3) {
      assistant.pop()
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
Deno.writeFile(args['output'] || 'export.json', encoder.encode(logJson))