'use strict'

const fs = require('fs')
const HTMLTreeNode = require('./html-node').HTMLTreeNode

const countCharOccurences = (str, char) => {
    let count = 0
    for (let i = 0; i < str.length; i++) {
        if (str[i] === char) {
            count++
        }
    }
    return count
}

const mapTextLineToHtmlProps = line => {

    const split = line.split(' ').filter(s => s !== '')
    const tag = split[0]
    const attributes = split.filter((s, i) => i !== 0).join(' ')
    
    const properties = {
        tag,
        text: '',
        attributes
    }

    return properties
}

const extractProperties = rawAttrs => {
    const attributesArray = rawAttrs.split("=")
    // return attributesArray.reduce((map, curr) => {
    //     const [key, value] = curr.split('=')
    //     map[key] = value.trim().replace(/'/g, '')
    //     return map
    // }, {})
    return {}
}

const textToTreeDfs = (textArr, index, depth, visitedLines) => {
    const rawString = textArr[index].trim()
    const {tag, text, attributes} = mapTextLineToHtmlProps(rawString)

    const node = new HTMLTreeNode(
        tag,
        text,
        attributes
    )
    for (let i = index + 1; i < textArr.length; i++) {
        if (!visitedLines[i]) {
            const line = textArr[i]
            const numTabs = countCharOccurences(line, '\t')
            const trimmed = line.trim()
            if (trimmed[0] === '|' && numTabs > depth) {
                node.text += trimmed.substring(1).trim()
                visitedLines[i] = true
            } else if (numTabs > depth) {
                node.addChild(textToTreeDfs(textArr, i, numTabs, visitedLines))
                visitedLines[i] = true
            }
            if (numTabs <= depth) {
                return node
            }
        }
        
    }
    return node
}

const htmlDfs = node => {
    let str = `<${node.tag} ${node.attrs}>${node.text}`
    for (let i = 0; i < node.children.length; i++) {
        str += htmlDfs(node.children[i])
    }
    str += `</${node.tag}>`
    return str
}

const treeToHtml = root => {
    let html = ''
    const {children} = root

    for (let i = 0; i < children.length; i++) {
        html += htmlDfs(children[i])
    }

    return html
}

const writeToHtmlFile = (fileName, content) => {
    fs.writeFile(fileName, content, err => {
        if (err) {
            throw err
        }
    })
}

const main = fileName => {
    const text = fs.readFileSync(fileName, 'ascii')
    const arr = text.split('\r\n').filter(l => l.trim().length > 0)
    
    const root = {
        children: []
    }
    for (let i = 0; i < arr.length; i++) {
        const line = arr[i]
        if (countCharOccurences(line, '\t') === 0) {
            root.children.push(textToTreeDfs(arr, i, 0, {}))
        }
    }
    console.log(JSON.stringify(root, null, 4))
    const html = treeToHtml(root)
    writeToHtmlFile('result.html', html)
}

main('./test.chut')
