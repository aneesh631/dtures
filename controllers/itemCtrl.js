const {Item} = require('./../server/models/item')

const ObjectID = require('mongodb').ObjectID

const getRoot = async () => Item.findOne({'name':'root'})

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
    return new_item
}
const removeById = async (id) => {
    let children = await getChildrenId(id)
    if(children.length == 0)
        return Item.findByIdAndRemove(id)
    for (child of children)
        await removeById(child)
    return Item.findByIdAndRemove(id)
}

const deleteItem = async (body) => {
    let deletedItem = await removeById(body.child)
    let deletedChild = await Item.findByIdAndUpdate(body.parent,{$pull: {children: ObjectID(body.child)}})
    return deletedItem
}

const isT = async (id) => {
    let item = await Item.findById(id)
    return item.isTerminal
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