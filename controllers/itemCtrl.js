const {Item} = require('./../server/models/item')

const ObjectID = require('mongodb').ObjectID

const getRoot = async () => Item.findOne({'name':'root'})

let root
getRoot().then(rootNode => root = rootNode._id)

const getAlias = async (id) => {
    let data = await Item.findById(id)
    if(data.alias != '')
        return data.alias
    return false
}
const getLabel = async (id) => {
    let data = await Item.findById(id)
    return data.label
}

const getChildrenId = async (id) => {
    let data = await Item.findById(id)
    let alias = await getAlias(data.id)
    if(alias!=false)
        data = await Item.findById(alias)
    return data.children
}

const addChild = async (parentID,childID) => {
    return Item.findByIdAndUpdate(parentID,{$push: {children: childID}})
}

const removeChild = async (parentID,childID) => {
    return Item.findByIdAndUpdate(parentID,{$pull: {children: ObjectID(childID)} } )
}

const getItems = async (id) => {
    let x = {
        label: '',
        options: []
    }
    let children = (id == 'root')?await getChildrenId(root):await getChildrenId(id)
    x.label = await getLabel(children[0])
    for(child of children){
        let op = {}
        op.id = child
        let data = await Item.findById(child)
        op.name = data.name
        op.isTerminal = data.isTerminal
        x.options.push(op)
    }
    return x
}

const addItems = async (body,id) => {
    if(!id) id = root
    let alias = await getAlias(id)
    if(alias!=false){
        id = await Item.findById(alias)
        id = id.id
    }
    let new_item = await new Item({name: body.name, label: body.label,isTerminal: body.isTerminal}).save()
    await Item.findByIdAndUpdate(id,{$push: {children: new_item._id}})
    await sort(id);
    return new_item
}
const removeById = async (id) => {
    let children = await getChildrenId(id)
    for (child of children)
        await removeById(child)
    return Item.findByIdAndRemove(id)
}

const deleteItem = async (body) => {
    let deletedItem = await removeById(body.child)
    let parent = body.parent
    if(!parent)
        parent=root
    await Item.findByIdAndUpdate(parent,{$pull: {children: ObjectID(body.child)}})
    await sort(parent)
    return deletedItem
}

const isT = async (id) => {
    let item = await Item.findById(id)
    return item.isTerminal
}
const sort = async (id) => {
    if(await Item.findById(id).isTerminal)
        return;
    let children = await getChildrenId(id);
    let newChildren = []
    for(child of children){
        let newName = await Item.findById(child);
        let temp = {
            id: child,
            name: newName.name
        }
        newChildren.push(temp)
    }
    newChildren.sort((a,b) => a.name > b.name)
    newChildren = newChildren.map((v) => v.id)
    await Item.findByIdAndUpdate(id,{children: newChildren});
}
const containsLoop = async (body) => {
    let visited = {}
    let current = await Item.findById(body.to)
    visited[body.from]=true
    while(1){
        if(visited[current.id]==true)
            return true
        visited[current.id]=true
        if(current.alias)
            current = await Item.findById(current.alias)
        else return false;
    }
}
const getAliasDest = async (body) => {
    let current = await Item.findById(body.to)
    while(1){
        if(current.alias)
            current = await Item.findById(current.alias)
        else return current.id;
    }
}
const addAlias = async (body) => {
    let dest = body.to
    if(await containsLoop(body))
        throw new Error('Loop deteted!')
    else dest = await getAliasDest(body)
    await Item.findByIdAndUpdate(body.from,{$set: {alias: dest}})
}

const getAllAliases = async () => {
    let items = await Item.find({alias: {$ne: ""}})
    let output = []
    for(item of items){
        let temp = {
            id: item.id,
            from: {
                name: item.name,
                label: item.label
            }
        }
        let dest = await Item.findById(item.alias)
        temp.to = {
            name: dest.name,
            label: dest.label
        }
        output.push(temp)
    }
    return output
}

const deleteAlias = async (id) => {
    await Item.findByIdAndUpdate(id,{$set:{alias: ""}})
}

module.exports = {
    getRoot,
    getLabel,
    getChildrenId,
    getItems,
    addItems,
    deleteItem,
    addChild,
    removeChild,
    removeById,
    isT,
    addAlias,
    getAllAliases,
    deleteAlias
}