var fs = require ('fs');

var mdjson = require("metadata-json-oda");

var root = mdjson.loadFromFile("courseware.mdj");

function Fields(elem){
    return [...elem.attributes,...elem.getInheritedAttributes()].map(attr =>({
        name: attr.name,
        required: attr.stereotype && attr.stereotype.name == 'required'|| undefined,
        type: attr.type && attr.type.name === 'String' ? undefined: attr.type && attr.type.name || undefined,
        derived: attr.isDerived || undefined,
        unique: attr.isID || undefined,
        indexed: attr.isID || undefined,// придумать
        //fields/// для операций... простые типы возвращает.
    }));
}

function Entity (elem){
    return {
        name: elem.name,
        fields: Fields(elem),
    }
}

var code = mdjson.Repository.findAll(i=>i.stereotype && i.stereotype.name=="Node");

fs.writeFileSync('./sample.model.json', JSON.stringify(code.map(ent => Entity(ent))));

debugger;
