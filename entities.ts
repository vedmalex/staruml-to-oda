export default [
   {
     "name": "GasStation",
     "fields": [
       { "name": "name", "identity": true },
       { "name": "address", "required": true },
       { "name": "city", "required": true },
       { "name": "state", "required": true },
       { "name": "country", "required": true },
       { "name": "zipcode", "required": true },
       { "name": "location", "required": true },
       { "name": "countOfPumps", "required": true },
       { "name": "company", "relation": { "belongsTo": "Company#" } },
       { "name": "orders", "relation": { "hasMany": "Order#gasStation" } },
       { "name": "offers", "relation": { "hasMany": "Offer#gasStation" } }
     ]
   },
   {
     "name": "FuelType",
     "fields": [
       { "name": "name", "identity": true },
       {
         "name": "customer",
         "relation": {
           "belongsToMany": "Customer#",
           "using": "FavoriteUserFuelType#"
         }
       },
       { "name": "offers", "relation": { "hasMany": "Offer#fuelType" } }
     ]
   },
   {
     "name": "Company",
     "fields": [
       { "name": "name", "identity": true },
       { "name": "logo" },
       { "name": "description" },
       { "name": "rating", "type": "Int" },
       { "name": "createdAt", "type": "Date" },
       { "name": "updatedAt", "type": "Date" },
       { "name": "deletedAt", "type": "Date" },
       { "name": "stations", "relation": { "hasMany": "GasStation#company" } }
     ]
   },
   {
     "name": "Offer",
     "fields": [
       { "name": "name", "identity": true },
       { "name": "startAt", "required": true, "type": "Date" },
       { "name": "expiredAt", "required": true, "type": "Date" },
       { "name": "maxPeopleToBuy", "required": true, "type": "Int" },
       { "name": "costOneGasUnit", "required": true, "type": "Float" },
       { "name": "currency", "required": true },
       { "name": "minGasUnitsToBuy", "required": true, "type": "Float" },
       { "name": "maxGasUnitsToBuy", "required": true, "type": "Float" },
       { "name": "totalGasUnits", "required": true, "type": "Float" },
       { "name": "gasUnitType", "required": true },
       { "name": "isActive", "type": "Boolean" },
       { "name": "description" },
       { "name": "createdAt", "type": "Date" },
       { "name": "updatedAt", "type": "Date" },
       { "name": "deletedAt", "type": "Date" },
       { "name": "repeatSettings", "type": "Date" },
       { "name": "gasStation", "relation": { "belongsTo": "GasStation#" } },
       { "name": "orders", "relation": { "hasMany": "Order#offer" } },
       { "name": "fuelType", "relation": { "belongsTo": "FuelType#" } }
     ]
   },
   {
     "name": "Order",
     "fields": [
       { "name": "date", "required": true, "type": "Date" },
       { "name": "gasUnitsType", "required": true },
       { "name": "gasAmount", "required": true, "type": "Float" },
       { "name": "moneyAmount", "required": true, "type": "Float" },
       { "name": "currency", "required": true },
       { "name": "createdAt", "type": "Date" },
       { "name": "updatedAt", "type": "Date" },
       { "name": "deletedAt", "type": "Date" },
       { "name": "gasStation", "relation": { "belongsTo": "GasStation#" } },
       { "name": "offer", "relation": { "belongsTo": "Offer#" } },
       {
         "name": "transactions",
         "relation": { "hasMany": "Transaction#order" }
       },
       { "name": "customer", "relation": { "belongsTo": "Customer#" } }
     ]
   },
   {
     "name": "Transaction",
     "fields": [
       { "name": "date", "required": true, "type": "Date" },
       { "name": "transactionType", "required": true },
       { "name": "gasUnitType", "required": true },
       { "name": "gasAmount", "required": true, "type": "Float" },
       { "name": "currency", "required": true },
       { "name": "moneyAmount", "required": true, "type": "Float" },
       { "name": "createdAt", "type": "Date" },
       { "name": "updatedAt", "type": "Date" },
       { "name": "deletedAt", "type": "Date" },
       { "name": "order", "relation": { "belongsTo": "Order#" } },
       { "name": "customer", "relation": { "hasOne": "Customer#transactions" } }
     ]
   },
   {
     "name": "FavoriteUserFuelType",
     "fields": [
       { "name": "fuelType", "type": "ID" },
       { "name": "customer", "type": "ID" }
     ]
   },
   {
     "name": "Customer",
     "fields": [
       { "name": "email", "identity": true },
       { "name": "carType" },
       { "name": "activationCode" },
       { "name": "resetCode" },
       { "name": "lastVisitAt", "type": "Date" },
       { "name": "locationWork" },
       { "name": "locationHome" },
       { "name": "zipcodeWork" },
       { "name": "deletedAt", "type": "Date" },
       { "name": "updatedAt", "type": "Date" },
       { "name": "registeredAt", "type": "Date" },
       { "name": "zipcodeHome" },
       { "name": "rating", "type": "Int" },
       { "name": "lastName" },
       { "name": "firstName" },
       { "name": "isAcceptedAgreement", "type": "Boolean" },
       { "name": "isProfileFilled", "type": "Boolean" },
       { "name": "phoneNumber", "identity": true },
       {
         "name": "favoriteFuleTypes",
         "relation": {
           "belongsToMany": "FuelType#",
           "using": "FavoriteUserFuelType#"
         }
       },
       { "name": "orders", "relation": { "hasMany": "Order#customer" } },
       {
         "name": "transactions",
         "relation": { "hasOne": "Transaction#customer" }
       },
       { "name": "credential", "relation": { "belongsTo": "User#" } }
     ]
   },
   {
     "name": "User",
     "fields": [
       { "name": "userName", "identity": true },
       { "name": "password", "required": true },
       { "name": "isAdmin", "type": "Boolean" },
       { "name": "isSystem", "type": "Boolean" },
       { "name": "enabled", "type": "Boolean" },
       { "name": "isCustomer", "type": "Boolean" },
       { "name": "customer", "relation": { "hasOne": "Customer#credential" } }
     ]
   }
 ]