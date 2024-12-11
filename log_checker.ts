import * as yaml from "@std/yaml"
import { parseArgs } from '@std/cli'

const decoder = new TextDecoder()

const args = parseArgs(Deno.args)

const file = await Deno.readFile(args['input'])
const rawText = decoder.decode(file)
const text = rawText.replaceAll('*', "ABCABC")
const lines = text.split('\n')

for (const i in lines) {
    let lineNumber = parseInt(i, 10)
    if (lines[i].startsWith('{')) {
        let dataObject: any
        try {
            dataObject = yaml.parse(lines[lineNumber]) as any
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
        console.log(JSON.stringify(dataObject, null, 4))
    }
}