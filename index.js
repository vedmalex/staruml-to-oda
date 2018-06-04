var fs = require('fs');

var mdjson = require("metadata-json-oda");

const { Validator, Repository } = mdjson;

var root = mdjson.loadFromFile("courseware.mdj");



function extractTypeName(type) {
    return typeof type === 'string' ?
        (type.toLowerCase() === 'string' ? undefined : type)
        : (typeof type.name === 'string' ? type.name : undefined);
}

function returnType(op) {
    var item = (op.parameters || []).find(p => p.direction === 'return');
    if (item) {
        return extractTypeName(item.type)
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
                type: extractTypeName(p.type),
                required: p.stereotype && p.stereotype.name == 'required' || undefined,
                defaultValue: p.defaultValue || undefined,
            })),
    };
}

function Operations(elem) {
    return [
        ...(elem.operations || []),
        ...elem.getInheritedOperations(),
    ].map(Operation);
}

function multiplicity(attr) {
    return (attr.multiplicity === '0..1' || attr.multiplicity === '1') ? 'one' : 'many';
}

function Relation(opposite) {
    var attr = opposite._parent.end1 === opposite ? opposite._parent.end2 : opposite._parent.end1;
    if (attr.name) {
        // if(attr.name == "rightOne") debugger;
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
        identity: attr.isID || attr.stereotype && attr.stereotype.name == 'identity' || undefined,
        indexed: attr.isID || undefined, // придумать
    }
}

function Fields(elem) {
    return [
        ...(elem.attributes || []),
        ...(elem.getInheritedAttributes && elem.getInheritedAttributes() || []),
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

function InputType(elem) {
    return {
        name: elem.name,
        description: elem.documentation || undefined,
        fields: [
            ...Fields(elem),
        ],
    }
}

function InputType(elem) {
    return {
        name: elem.name,
        description: elem.documentation || undefined,
        fields: [
            ...Fields(elem),
        ],
    }
}



const rules = [
    {
        id: "ODA00100",
        message: "Name of query must be unique",
        appliesTo: ["UMLOperation"],
        exceptions: [],
        constraint: function (elem) {
            if (elem.stereotype && elem.stereotype.name == 'query') {
                const found = Repository.findAll(i => elem !== i && elem.name === i.name && i.stereotype && i.stereotype.name == "query");
                return found.length === 0;
            }
            return true;
        }
    },
    {
        id: "ODA00101",
        message: "query not applicable to this type",
        appliesTo: ["UMLModelElement"],
        exceptions: ["UMLOperation"],
        constraint: function (elem) {
            if (elem.stereotype && elem.stereotype.name == 'query'){
                return false;
            } else {
                return true;
            }
        }
    },
    {
        id: "ODA00200",
        message: "Name of mutation must be unique",
        appliesTo: ["UMLModelElement"],
        exceptions: [],
        constraint: function (elem) {
            if (elem.stereotype && elem.stereotype.name == 'mutation') {
                const found = Repository.findAll(i => elem !== i && elem.name === i.name && i.stereotype && i.stereotype.name == "mutation");
                return found.length === 0;
            }
            return true;
        }
    },
    {
        id: "ODA00201",
        message: "mutation not applicable to this type",
        appliesTo: ["UMLModelElement"],
        exceptions: ["UMLOperation"],
        constraint: function (elem) {
            if (elem.stereotype && elem.stereotype.name == 'mutation'){
                return false;
            } else {
                return true;
            }
        }
    },
    {
        id: "ODA003",
        message: "interface must have attributes",
        appliesTo: ["UMLModelElement"],
        exceptions: [],
        constraint: function (elem) {
            if (elem.stereotype && elem.stereotype.name == 'interface') {
                return elem.attributes.length > 0
            }
            return true;
        }
    },
    {
        id: "ODA004",
        message: "union must have no attributes",
        appliesTo: ["UMLModelElement"],
        exceptions: [],
        constraint: function (elem) {
            if (elem.stereotype && elem.stereotype.name == 'union') {
                return elem.attributes.length === 0
            }
            return true;
        }
    },
    {
        id: "ODA005",
        message: "input is only for UMLClass",
        appliesTo: ['UMLModelElement'],
        exceptions: ["UMLClass"],
        constraint: function (elem) {
            return !elem.stereotype || (elem.stereotype && elem.stereotype.name !== 'input');
        }
    },
    {
        id: "ODA006",
        message: "type for attribute must exists in model",
        appliesTo: ['UMLAttribute'],
        exceptions: [],
        constraint: function (elem) {
            return !elem.type || typeof elem.type !== 'string' || (typeof elem.type === 'string' && Repository.select(elem.type).length > 0);
        }
    },

    // return value for mutations must be entity/node/payload 
    // associationEnds must have multiplicity
    // navigable not persistend end must be derived in code
    // схема должна содержать хотя бы одну ссылку на сущность
];

Validator.addRules(rules);

var failed = Validator.validate();
console.log(failed);
//links
var links = Repository.select("@UMLAssociationClassLink");
//

var entities = Repository
    .findAll(i => i.stereotype && (i.stereotype.name == "node" || i.stereotype.name == "entity"))
    .map(Entity);

//
var inputTypes = Repository
    .findAll(i => i.constructor.name === 'UMLClass' && i.stereotype && i.stereotype.name == "input")
    .map(InputType);

//  
var payload = Repository
    .findAll(i => i.stereotype && i.stereotype.name == "payload")
// .map(InputType);

//
var schemas = Repository.findAll(i => i.stereotype && i.stereotype.name == "schema");
//
var mutations = Repository.findAll(i => i.stereotype && i.stereotype.name == "mutation")
//
var queries = Repository.findAll(i => i.stereotype && i.stereotype.name == "query");
//
var enums = Repository.findAll(i => (i.stereotype && i.stereotype.name == "enum") || i.constructor.name === 'UMLEnumeration');
// UMLOperation

//RULE: все операции и запросы должны быть уникальны по названию во всех моделе

//UMLStereotype

/*
"Tag": {
    "kind": "class",
    "super": "Model",
    "attributes": [
        { "name": "kind",      "kind": "enum", "type": "TagKind", "visible": true },
        { "name": "value",     "kind": "prim", "type": "String",  "visible": true, "multiline": true },
        { "name": "reference", "kind": "ref",  "type": "Model",   "visible": true },
        { "name": "checked",   "kind": "prim", "type": "Boolean", "visible": true },
        { "name": "number",    "kind": "prim", "type": "Integer", "visible": true }
    ]
},
*/

debugger;
fs.writeFileSync('./sample.model.json', JSON.stringify(entities));
// fs.writeFileSync('./sample.packages.json', JSON.stringify(code.map(ent => Entity(ent))));

