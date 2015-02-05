function BiopaxParser(biopaxXml){
    var self = {};
    self.biopaxXml = biopaxXml;

    self.pathways = [];
    self.proteins = [];
    self.smallMolecules = [];
    self.complexes = [];
    self.reactions = [];
    self.idsMap = {};


    var parseId = function(id){
        return id.split("#")[1];
    };

    var parseProtein = function(node){
        var protein = {
            "id" : d3.select(node).attr("rdf:ID"),
            "name" : d3.select(node).select("displayName").text(),
            "type" : "protein"
        };

        self.proteins.push(protein);
        return protein;
    };

    var parseSmallMolecule = function(node){
        var smallMolecule = {
            "id" : d3.select(node).attr("rdf:ID"),
            "name" : d3.select(node).select("displayName").text(),
            "type" : "smallMolecule"
        };

        self.smallMolecules.push(smallMolecule);
        return smallMolecule;
    };

    var parseComplex = function(node){

        var complex = {
            "id" : d3.select(node).attr("rdf:ID"),
            "name" : d3.select(node).select("displayName").text(),
            "type" : "complex"
        };

        complex.componentsId = [];

        d3.select(node).selectAll("component").each(function(d){
            var id =  parseId(d3.select(this).attr("rdf:resource"));
            complex.componentsId.push(id)
        });

        self.complexes.push(complex);
        return complex;
    };


    var parseReaction = function(node){
        var reaction = {
            "id" : d3.select(node).attr("rdf:ID"),
            "name" : d3.select(node).select("displayName").text(),
            "type" : "reaction"
        };

        reaction.leftIds = [];
        reaction.rightIds = [];

        ["left", "right"].forEach(function(side){
            d3.select(node).selectAll(side).each(function(d){
                var id =  parseId(d3.select(this).attr("rdf:resource"));
                if(side == "left"){
                    reaction.leftIds.push(id);
                } else {
                    reaction.rightIds.push(id);
                }
            });
        });

        self.reactions.push(reaction);
        return reaction;
    };


    var parsePathway = function(node){

        var pathway = {
            "id" : d3.select(node).attr("rdf:ID"),
            "name" : d3.select(node).select("displayName").text(),
            "type" : "pathway"
        };

        pathway.componentsId = [];

        d3.select(node).selectAll("pathwayComponent").each(function(d){
            var id =  parseId(d3.select(this).attr("rdf:resource"));
            pathway.componentsId.push(id)
        });

        self.pathways.push(pathway);
        return pathway;

    };


    var parsers = {
        "bp:Protein" :   parseProtein,
        "bp:Complex" :   parseComplex,
        "bp:BiochemicalReaction" : parseReaction,
        "bp:SmallMolecule" : parseSmallMolecule,
        "bp:Pathway" : parsePathway
    };

    //create links between complexes and proteins if there are on left and right of a reaction
    //DEPRECATED
    self.createComponentsConnections = function(){

        var links = [];

        self.complexes.concat(self.proteins).forEach(function (component) {
            component.nextComponents = [];

            self.pathways.forEach(function (pathway) {
                pathway.reactions.forEach(function (reaction) {
                    if(reaction.left.indexOf(component) > -1){
                        var rights = reaction.right.filter(function(d){return d.type == "complex" || d.type == "protein" });
                        rights.forEach(function (right) {
                            links.push({source: component, target: right, pathway:pathway});
                        });
                    }
                })
            });

            //self.reactions.forEach(function (reaction) {
            //
            //    if(reaction.left.indexOf(component) > -1){
            //        var right = reaction.right.filter(function(d){return d.type == "complex" || d.type == "protein" });
            //        component.nextComponents = _.union(component.nextComponents, right);
            //    }
            //})
        });

        return links;
    };


    var init = function(){
        //parse elements
        self.biopaxXml.selectAll("Protein, Complex, BiochemicalReaction, SmallMolecule, Pathway").each(function(d){
            var parser = parsers[this.tagName];
            if(parser){
                var newElement = parser(this);
                self.idsMap[newElement.id] = newElement;
            }
        });

        //create connections for complexes
        self.complexes.forEach(function(complex){
            complex.components = [];
            complex.componentsId.forEach(function(componentId){
                var component = self.idsMap[componentId];
                if(component){
                    complex.components.push(component);
                } else {
                    console.warn(componentId + " does not exist");
                }

            });

            complex.componentsId = undefined;
        });

        //create connection for reactions
        self.reactions.forEach(function(reaction){
            reaction.left = [];
            reaction.right = [];

            reaction.leftIds.forEach(function(componentId){
                var component = self.idsMap[componentId];
                if(component){
                    reaction.left.push(component);
                } else {
                    console.warn(componentId + " does not exist");
                }
            });

            reaction.rightIds.forEach(function(componentId){
                var component = self.idsMap[componentId];
                if(component){
                    reaction.right.push(component);
                } else {
                    console.warn(componentId + " does not exist");
                }

            });

            reaction.rightIds = reaction.leftIds = undefined;
        });

        //create connection for pathways
        self.pathways.forEach(function(pathway){
            pathway.reactions = [];
            pathway.components = [];
            pathway.pathways = [];
            pathway.componentsId.forEach(function(componentId){
                var component = self.idsMap[componentId];
                if(component){
                    if(component.type == "reaction"){
                        pathway.reactions.push(component);
                        pathway.components = _.union(pathway.components, component.left);
                        pathway.components = _.union(pathway.components, component.right);
                    } else if(component.type == "pathway"){
                        pathway.pathways.push(component);
                    } else {
                        console.warn(componentId + " does not exist");
                    }
                } else {
                    console.warn(componentId + " does not exist");
                }

            });

            pathway.componentsId = undefined;
        });

        //flattern pathways elements
        self.pathways.forEach(function(pathway){

            function getAllComponents(pw, expanded){
                expanded.push(pw);
                var components = [].concat(pw.components);
                //do not explore already expanded pathways
                pw.pathways.filter(function(p){return expanded.indexOf(p) == -1}).forEach(function(subpw){
                    components = _.union(components, getAllComponents(subpw, expanded));
                });

                return components;
            }

            function getAllReactions(pw, expanded){
                expanded.push(pw);
                var reactions = [].concat(pw.reactions);
                //do not explore already expanded pathways
                pw.pathways.filter(function(p){return expanded.indexOf(p) == -1}).forEach(function(subpw){
                    reactions = _.union(reactions, getAllReactions(subpw, expanded));
                });

                return reactions;
            }

            pathway.allComponents = getAllComponents(pathway, []);
            pathway.allReactions = getAllReactions(pathway, []);
        });


        //flattern complex elements
        self.complexes.forEach(function(complex){

            function getAllProteins(c){
                var components = [].concat(c.components.filter(function(e){return e.type == "protein"}));
                //do not explore already expanded pathways
                c.components.filter(function(e){return e.type == "complex"}).forEach(function(e){
                    components = _.union(components, getAllProteins(e));
                });

                return components;
            }

            function getAllComplexes(c){
                var components = [].concat(c.components.filter(function(e){return e.type == "complex"}));
                //do not explore already expanded pathways
                c.components.filter(function(e){return e.type == "complex"}).forEach(function(e){
                    components = _.union(components, getAllComplexes(e));
                });

                return components;
            }

            complex.allProteins = complex.allComponents = getAllProteins(complex);
            complex.allComplexes = getAllComplexes(complex);
        });


        //create the references from complexes / proteins to pathways
        self.proteins.concat(self.complexes).concat(self.smallMolecules).forEach(function(component){
            component.pathways = [];
            self.pathways.forEach(function(pathway){
               if(pathway.allComponents.indexOf(component) > -1){
                   component.pathways.push(pathway);
               }
            });
        });

        //create the references from reactions to pathways
        self.reactions.forEach(function(reaction){
            reaction.pathways = [];
            self.pathways.forEach(function(pathway){
                if(pathway.allReactions.indexOf(reaction) > -1){
                    reaction.pathways.push(pathway);
                }
            });
        });


    }();


    return self;
}