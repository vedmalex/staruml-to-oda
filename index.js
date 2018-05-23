var fs = require('fs');

var mdjson = require("metadata-json-oda");

var root = mdjson.loadFromFile("courseware.mdj");

function returnType(op) {
    var item = (op.parameters || []).find(p => p.direction === 'return');
    if (item) {
        return item.type.name === 'String'? undefined : item.type.name;
    }
}

function Operation(attr){
    return {
        ...Field(attr),
        type: returnType(attr),
        args: attr.parameters
        .filter(p=>p.direction === 'in')
        .map(p => ({
            name: p.name,
            type: p.type && p.type.name === 'String' ? undefined : p.type && p.type.name || undefined,
            required: p.stereotype && p.stereotype.name == 'required' || undefined,
            defaultValue: p.defaultValue || undefined,
        })),
    };
}

function Operations(elem) {
    return [
        ...elem.operations,
        ...elem.getInheritedOperations(),
    ].map(Operation);
}

function Field(attr){
    return {
        name: attr.name,
        required: attr.stereotype && attr.stereotype.name == 'required' || undefined,
        type: attr.type && attr.type.name === 'String' ? undefined : attr.type && attr.type.name || undefined,
        derived: attr.isDerived || undefined,
        unique: attr.isID || undefined,
        indexed: attr.isID || undefined,// придумать
    }
}

function Fields(elem) {
    return [
        ...elem.attributes,
        ...elem.getInheritedAttributes(),
    ].map(Field);
}

function Entity(elem) {
    return {
        name: elem.name,
        fields: [
            ...Fields(elem),
            ...Operations(elem),
        ],
    }
}

var code = mdjson.Repository.findAll(i => i.stereotype && i.stereotype.name == "Node");

fs.writeFileSync('./sample.model.json', JSON.stringify(code.map(ent => Entity(ent))));

debugger;
