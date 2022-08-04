class MyLogDb {
    constructor() {
        this.PATH_DB = `./src/db/mylog.db`
        this.PATH_WASM = `./src/lib/sql.js/1.7.0`
        this.SQL = null
        this.DB = null
    }
    async load() {
        if (!this.DB) {
            //this.SQL = await initSqlJs({locateFile: file => `${this.PATH_WASM}/${file}`})
            this.SQL = await initSqlJs({locateFile: file =>{console.log(`${this.PATH_WASM}/${file}`); return `${this.PATH_WASM}/${file}`}})
            const res = await fetch(this.PATH_DB)
            const buf = await res.arrayBuffer()
            this.DB = new this.SQL.Database(new Uint8Array(buf))
        }
        return this.DB
    }
    async save() {
        window.myApi.writeFile(this.PATH_DB, this.DB.export());
    }
    async clear() { await this.dexie.comments.clear() }
    async delete(ids) {
        console.debug(ids)
        const isAll = (0===ids.length)
        const msg = ((isAll) ? `つぶやきをすべて削除します。` : `選択したつぶやきを削除します。`) + `\n本当によろしいですか？`
        if (confirm(msg)) {
            console.debug('削除します。')
            if (isAll) { console.debug('全件削除します。'); await this.dexie.comments.clear() }
            else { console.debug('選択削除します。'); for (const id of ids) { await this.dexie.comments.delete(id) } }
            console.debug(await this.dexie.comments.toArray())
        }
    }
    async insert(content, now) {
        console.debug(`挿入`, content, now)
        const id = await this.dexie.comments.put({
            content: content,
            created: now,
        })
        console.debug(id, content, now)
        const address = (window.mpurse) ? await window.mpurse.getAddress() : null
        //return this.#insertHtml(id, content, now)
        return TextToHtml.toHtml(id, content, now, address) 
    }
    #insertHtml(id, content, created) { return `<p>${this.#toContent(content)}<br>${this.#toTime(created)}${this.#toDeleteCheckbox(id)}</p>` }
    async toHtml() {
        const address = (window.mpurse) ? await window.mpurse.getAddress() : null
        const res = this.DB.exec(`select id,content,created from comments order by created desc;`)
        return res[0].values.map(r=>TextToHtml.toHtml(r[0], r[1], r[2], address)).join('')
    }
    /*
    async toHtml() {
        const cms = await this.dexie.comments.toArray()
        cms.sort((a,b)=>b.created - a.created)
        //return cms.map(c=>this.#insertHtml(c.id, c.content, c.created)).join('')
        const address = (window.mpurse) ? await window.mpurse.getAddress() : null
        return cms.map(c=>TextToHtml.toHtml(c.id, c.content, c.created, address)).join('')
    }
    */
    #toTime(created) {
        const d = new Date(created * 1000)
        const u = d.toISOString()
        //const l = d.toLocaleString({ timeZone: 'Asia/Tokyo' }).replace(/\//g, '-')
        const l = this.#toElapsedTime(created)
        return `<time datetime="${u}" title="${u}">${l}</time>`
    }
    #toElapsedTime(created) { // 年、月、日が現在と同じなら省略する
        // 同じ日なら時間だけ表示
        // 同じ年なら月日だけ表示
        // それ以降なら年月日表示
        const d = new Date(created * 1000)
        console.debug(this.now.getTime() - created)
        console.debug(this.now.getYear()===d.getYear(), this.now.getMonth()===d.getMonth(), d.getDate() < this.now.getDate())
        console.debug(this.now.getYear(), d.getYear(), this.now.getMonth(), d.getMonth(), d.getDate(), this.now.getDate())
        if (d.getYear() < this.now.getYear()) { return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}` } // 一年間以上
        else if (this.now.getYear()===d.getYear() && this.now.getMonth()===d.getMonth() && d.getDate() < this.now.getDate()) {
            return `${(d.getMonth()+1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`
        }
        else { return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}` } // 同じ日
    }
    #toContent(content) { return TextToHtml.toHtml(content) } 
    //#toContent(content) {
    //    return content.replace(/\r\n|\n/g, '<br>')
    //}
    #toDeleteCheckbox(id) {
        return `<label><input type="checkbox" name="delete" value="${id}">❌<label>`
    }
}
