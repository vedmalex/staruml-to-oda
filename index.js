var fs = require('fs');

var mdjson = require("metadata-json-oda");

var root = mdjson.loadFromFile("courseware.mdj");

function returnType(op) {
    var item = (op.parameters || []).find(p => p.direction === 'return');
    if (item) {
        return item.type.name === 'String' ? undefined : item.type.name;
    }
}

function Operation(attr) {
    return {
        ...Field(attr),
        type: returnType(attr),
        args: attr.parameters
            .filter(p => p.direction === 'in')
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

function multiplicity(attr) {
    return (attr.multiplicity === '0..1' || attr.multiplicity === '1') ? 'one' : 'many';
}

function Relation(opposite) {
    var attr = opposite._parent.end1 === opposite ? opposite._parent.end2 : opposite._parent.end1;
    if (attr.name) {
        if(attr.name == "rightOne") debugger;
        var own = multiplicity(attr);
        var opp = multiplicity(opposite);

        var verb;
        var using;

        if (opp == own && own == 'one') {
            if (attr.aggregation === 'composite' || attr.aggregation === 'shared') {
                verb = 'belonngsTo';
            } else {
                verb = 'hasOne';
            }
        } else if (opp == own && own == 'many') {
            verb = 'belongsToMany';
            var assoc = links.find(l => {
                return l.associationSide === attr._parent;
            });
            using = assoc ? assoc.classSide.name : undefined;
        } else {
            verb = own === 'one' ? 'belongsTo' : 'hasMany';
        }

        return {
            ...Field(attr),
            relation: {
                [verb]: `${attr.reference.name}#`,
                using,
            }
        }
    }
}

function Relations(elem) {
    return [
        ...elem.getAssociationEnds().map(Relation),
    ].filter(r => r);
}

function Field(attr) {
    return {
        name: attr.name,
        description: attr.documentation || undefined,
        required: attr.stereotype && attr.stereotype.name == 'required' || undefined,
        type: attr.type && attr.type.name === 'String' ? undefined : attr.type && attr.type.name || undefined,
        derived: attr.isDerived || undefined,
        unique: attr.isID || undefined,
        indexed: attr.isID || undefined, // придумать
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
        description: elem.documentation || undefined,
        fields: [
            ...Fields(elem),
            ...Operations(elem),
            ...Relations(elem),
        ],
    }
}

var links = mdjson.Repository.select("@UMLAssociationClassLink");
var diagrams = mdjson.Repository.select("@UMLDiagram");
var packages = mdjson.Repository.select("@UMLPackage");
var code = mdjson.Repository.findAll(i => i.stereotype && i.stereotype.name == "Node");


debugger;
fs.writeFileSync('./sample.model.json', JSON.stringify(code.map(ent => Entity(ent))));
fs.writeFileSync('./sample.pakcakges.json', JSON.stringify(code.map(ent => Entity(ent))));

