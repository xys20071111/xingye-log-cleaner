(function () {
    const logs = []
    document.querySelectorAll('.ant-dropdown-trigger')[0].click()
    setTimeout(() => {

        const userid = parseInt(document.querySelectorAll('.ant-dropdown-menu-title-content')[0].childNodes[0].getAttribute('href').split('-').pop(), 10)
        const npcid = parseInt(location.href.split('-').pop(), 10)

        const db = indexedDB.open(`LocalChatMessage_${userid}`)
        db.onsuccess = () => {
            const connection = db.result
            const transaction = connection.transaction(connection.objectStoreNames)
            const store = transaction.objectStore('data')
            const request = store.get(npcid)
            request.onsuccess = () => {
                for (const item of request.result.data.messageList) {
                    if (item.role_type === 'ai') {
                        if (item.type !== 'intro') {
                            logs.push({
                                role: 'assistant',
                                text: item.txt
                            })
                        } else {
                            logs.push({
                                role: 'system',
                                text: item.txt
                            })
                        }
                        continue
                    }
                    if (item.role_type === 'user') {
                        logs.push({
                            role: 'user',
                            text: item.txt
                        })
                    }
                }

                const time = new Date()
                const year = time.getFullYear()
                const month = time.getMonth() + 1
                const day = time.getDate()
                const hour = time.getHours()
                const minutes = time.getMinutes()
                const second = time.getSeconds()

                const blob = new Blob([JSON.stringify(logs, null, 4)], {
                    type: 'application/json'
                })
                const url = URL.createObjectURL(blob)
                const download = document.createElement('a')
                download.href = url
                download.download = `chat-export-${year}-${month}-${day}-${hour}-${minutes}-${second}.json`
                download.click()
            }
        }

    }, 1000)
})()