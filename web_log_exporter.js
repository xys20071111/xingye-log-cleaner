(function () {
    const logs = []
    let systemPrompt = ''
    document.querySelectorAll('.ant-dropdown-trigger')[0].click()
    setTimeout(() => {

        const userid = parseInt(document.querySelectorAll('.ant-dropdown-menu-title-content')[0].childNodes[0].getAttribute('href').split('-').pop(), 10)
        const [npcName, npcId] = location.href.split('/').pop().split('-')
        console.log(npcName, npcId)

        const db = indexedDB.open(`ChatDatabase_${userid}`)
        db.onsuccess = () => {
            const connection = db.result
            const transaction = connection.transaction(connection.objectStoreNames)
            const store = transaction.objectStore(transaction.objectStoreNames[0])
            const request = store.getAll()
            request.onsuccess = () => {
                console.log(request.result)
                for (const item of request.result) {
                    if (item.npcId === npcId) {
                        if (item.message.role_type === 'ai') {
                            if (item.message.type !== 'intro') {
                                logs.push({
                                    role: 'assistant',
                                    text: item.message.txt,
                                    timestamp: item.timestamp
                                })
                            } else {
                                systemPrompt = item.message.txt
                            }
                        }
                        if (item.message.role_type === 'user') {
                            logs.push({
                                role: 'user',
                                text: item.message.txt,
                                timestamp: item.timestamp
                            })
                        }
                    }
                }
                if (logs.length === 0) {
                    console.log('cannot get logs')
                    return
                }
                logs.sort((a, b) => {
                    return a.timestamp - b.timestamp
                })
                const time = new Date()
                const year = time.getFullYear()
                const month = time.getMonth() + 1
                const day = time.getDate()
                const hour = time.getHours()
                const minutes = time.getMinutes()
                const second = time.getSeconds()

                const blob = new Blob([JSON.stringify({
                    system: systemPrompt,
                    messages: log
                }, null, 4)], {
                    type: 'application/json'
                })
                const url = URL.createObjectURL(blob)
                const download = document.createElement('a')
                download.href = url
                download.download = `chat-export-${decodeURIComponent(npcName)}-${year}-${month}-${day}-${hour}-${minutes}-${second}.json`
                download.click()
            }
        }
    }, 1000)
})()