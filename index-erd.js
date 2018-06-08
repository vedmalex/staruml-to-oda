var fs = require("fs");
var { decapitalize, pluralize, singularize } = require('inflect');

function FLCapital(str){
  return str[0].toUpperCase() + str.slice(1);
}

var mdjson = require("metadata-json-oda");

const { Validator, Repository } = mdjson;

var root = mdjson.loadFromFile("db_scheme.mdj");

function extractTypeName(type) {
  return typeof type === "string"
    ? type.toLowerCase() === "string"
      ? undefined
      : type
    : typeof type.name === "string"
      ? type.name
      : undefined;
}

function returnType(op) {
  var item = (op.parameters || []).find(p => p.direction === "return");
  if (item) {
    return extractTypeName(item.type);
  }
}

function multiplicity(attr) {
  return attr.multiplicity === "0..1" || attr.multiplicity === "1"
    ? "one"
    : "many";
}

function Field(attr) {
  let result = {
    name: decapitalize(attr.name),
    description: attr.documentation || undefined,
    required: !attr.nullable || undefined,
    type: attr.type,
    identity: attr.unique || undefined,
    indexed: attr.foreignKey || undefined
  };

  if (attr.foreignKey && attr.referenceTo) {
    result = {
      ...result,
      relation: {
        belongsTo: `${attr.referenceTo._parent.name}#`
      }
    };
  } else if (attr.foreignKey && !attr.referenceTo) {
    console.log(`${attr._parent.name}->${attr.name}`);
  }
  return result;
}

function Fields(elem) {
  return [...(elem.columns || [])].map(Field);
}

function Entity(elem) {
  let pl = false; 
  pl = singularize(elem.name) !== elem.name;
  let singPl = pluralize(elem.name) == singularize(elem.name);

  return {
    name: FLCapital(singularize(elem.name)),
    plural : pl ? ( singPl ? `All${FLCapital(elem.name)}` : FLCapital(elem.name)) : undefined,
    description: elem.documentation || undefined,
    fields: [
      ...Fields(elem)
    ]
  };
}

function fixRelations(entities) {
  // Repository.select("@ERDRelationshipEnd")
  //   .filter(r => r.cardinality !== "1" && r.cardinality !== "0..1")
  //   .forEach(r => {
  //     const opposite = r._parent.end1 !== r ? r._parent.end1 : r._parent.end2;
  //     const ent = entities[FLCapital(singularize(opposite.reference.name))];
  //     if(!ent){ console.log(opposite.reference.name); debugger;}
  //     const fName = r.name || decapitalize(pluralize(r.reference.name));
  //     if(!ent.fields.find(f=>f.name === fName)) {
  //       ent.fields.push({
  //         name: fName,
  //         relation: {
  //           hasMany: `${r.reference.name}#`
  //         }
  //       });
  //     }
  //   });
  return Object.keys(entities).map(n=>entities[n]);
}


var entities = fixRelations(Repository.select("@ERDEntity")
.map(Entity)
.reduce((hash, cur) => {
  hash[cur.name] = cur;
  return hash;
}, {}));


fs.writeFileSync("./sample.model.json", JSON.stringify(entities));
// fs.writeFileSync('./sample.packages.json', JSON.stringify(code.map(ent => Entity(ent))));
