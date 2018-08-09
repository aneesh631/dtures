const {Item} = require('./../server/models/item')

const ObjectID = require('mongodb').ObjectID

const getRoot = async () => Item.findOne({'name':'root'})

let root
getRoot().then(rootNode => root = rootNode._id)

const getLabel = async (id) => {
    let data = await Item.findById(id)
    return data.label
}

const getChildrenId = async (id) => {
    let data = await Item.findById(id)
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
    isT
}