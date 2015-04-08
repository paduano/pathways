function BiopaxParser(biopaxXml){
    var self = {};
    self.biopaxXml = biopaxXml;

    self.pathways = [];
    self.rootPathways = [];
    self.proteins = [];
    self.smallMolecules = [];
    self.complexes = [];
    self.reactions = [];


    var parseId = function(id){
        return id.split("#")[1];
    };

    var parseProtein = function(node, components){

        var protein = {
            "id" : d3.select(node).attr("rdf:ID"),
            "name" : d3.select(node).select("displayName").text(),
            "type" : "protein"
        };
        var existing = checkForExistingComponent(self.proteins, protein);
        if(existing) {
            //the id might change
            existing.id = protein.id;
            components.proteins.push(existing);
            return existing;
        } else {
            self.proteins.push(protein);
            components.proteins.push(protein);
            return protein;
        }
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

    var parseComplex = function(node, components){

        var complex = {
            "id" : d3.select(node).attr("rdf:ID"),
            "name" : d3.select(node).select("displayName").text(),
            "type" : "complex"
        };

        //if(complex.name.toLowerCase() == "cyclin E/A:cdk2:p27/p21 complex".toLowerCase())debugger


        var existing = checkForExistingComponent(self.complexes, complex);

        if(existing) {
            //the id might change
            existing.id = complex.id;
            components.complexes.push(existing);
            return existing;
        } else {
            complex.componentsId = [];

            d3.select(node).selectAll("component").each(function(d){
                var id =  parseId(d3.select(this).attr("rdf:resource"));
                complex.componentsId.push(id)
            });

            self.complexes.push(complex);
            components.complexes.push(complex);
            return complex;
        }
    };


    var parseReaction = function(node, components){
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

        var existing = checkForExistingComponent(self.reactions, reaction);
        if(existing) {
            //the id might change
            existing.id = reaction.id;
            components.reactions.push(existing);
            return existing;
        } else {
            self.reactions.push(reaction);
            components.reactions.push(reaction);
            return reaction;
        }
    };


    var parsePathway = function(node, components){
        var pathway = {
            "id" : d3.select(node).attr("rdf:ID"),
            "name" : d3.select(node).select("displayName").text(),
            "type" : "pathway"
        };
        var existing = false//checkForExistingComponent(self.pathways, pathway);XXX
        if(existing) {
            console.error('same pathway duplicated');
            components.pathways.push(existing);
            return existing;
        } else {

            pathway.componentsId = [];

            d3.select(node).selectAll("pathwayComponent").each(function(d){
                var id =  parseId(d3.select(this).attr("rdf:resource"));
                pathway.componentsId.push(id)
            });

            self.pathways.push(pathway);
            components.pathways.push(pathway);
            return pathway;
        }


    };

    var checkForExistingComponent = function(components, node) {
        for(var i = 0; i < components.length; i++){
            var c = components[i];
            if(c.name == node.name){
                //console.log(c.name);
                return c
            }
        }
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


    self.loadBiopax = function(biopaxXml){
        var idsMap = {};

        var components = {
            pathways : [],
            complexes : [],
            reactions : [],
            proteins : []
        };
        //parse elements
        //self.biopaxXml.selectAll("Protein, Complex, BiochemicalReaction, SmallMolecule, Pathway").each(function(d){
        biopaxXml.selectAll("Protein, Complex, BiochemicalReaction, Pathway").each(function(d){
            var parser = parsers[this.tagName];
            if(parser){
                var newElement = parser(this, components);
                idsMap[newElement.id] = newElement;
            }
        });

        //create connections for complexes
        components.complexes.forEach(function(complex){
            //if is not already parsed
            if(complex.componentsId){
                complex.components = [];
                complex.componentsId.forEach(function(componentId){
                    var component = idsMap[componentId];
                    if(component){
                        complex.components.push(component);
                    } else {
                        //console.warn(componentId + " does not exist");
                    }

                });

                complex.componentsId = undefined;
            }
        });

        //var reactionsToBeRemoved = [];
        //create connection for reactions
        components.reactions.forEach(function(reaction){
            //if the reaction has not already been parsed in previous pws
            if(reaction.rightIds && reaction.rightIds){

                reaction.left = [];
                reaction.right = [];

                reaction.leftIds.forEach(function(componentId){
                    var component = idsMap[componentId];
                    if(component && (component.type == "protein" || component.type == "complex")){
                        reaction.left.push(component);
                    } else {
                        //console.warn(componentId + " does not exist");
                        //reactionsToBeRemoved.push(reaction);
                    }
                });

                reaction.rightIds.forEach(function(componentId){
                    var component = idsMap[componentId];
                    if(component && (component.type == "protein" || component.type == "complex")){
                        reaction.right.push(component);
                    } else {
                        //console.warn(componentId + " does not exist");
                        //reactionsToBeRemoved.push(reaction);
                    }

                });

                reaction.rightIds = reaction.leftIds = undefined;

            }
        });

        //console.warn(reactionsToBeRemoved.length + " reactions discarded");
        //components.reactions = _.difference(components.reactions, reactionsToBeRemoved);
        //reactionsToBeRemoved.forEach(function (reaction) {idsMap[reaction.id] = undefined});

        //create connection for pathways
        components.pathways.forEach(function(pathway){

            if(pathway.componentsId){
                pathway.reactions = [];
                pathway.components = [];
                pathway.pathways = [];
                pathway.componentsId.forEach(function(componentId){
                    var component = idsMap[componentId];
                    if(component){
                        if(component.type == "reaction"){
                            pathway.reactions.push(component);
                            pathway.components = _.union(pathway.components, component.left);
                            pathway.components = _.union(pathway.components, component.right);
                        } else if(component.type == "pathway"){
                            pathway.pathways.push(component);
                        } else {
                            //console.warn(componentId + " does not exist");
                        }
                    } else {
                        //console.warn(componentId + " does not exist");
                    }

                });

                pathway.componentsId = undefined;
            }

        });

        ////connect isolate proteins/complexes and reactions to root pathway
        //components.proteins.concat(components.complexes).concat(components.reactions).forEach(function (component) {
        //    if(!component.pathways){
        //        component.pathways = [components.pathways[0]];
        //        if(component.type == "reaction") {
        //            components.pathways[0].reactions.push(component);
        //        } else {
        //            components.pathways[0].components.push(component);
        //        }
        //    }
        //});

        //flattern pathways elements
        components.pathways.forEach(function(pathway){

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
        components.complexes.forEach(function(complex){

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
        components.proteins.concat(components.complexes).forEach(function(component){ ///.concat(components.smallMolecules)
            component.pathways = component.pathways || [];
            components.pathways.forEach(function(pathway){
               if(pathway.allComponents.indexOf(component) > -1){
                   component.pathways.push(pathway);
               }
            });
        });

        //create the references from reactions to pathways
        components.reactions.forEach(function(reaction){
            reaction.pathways = reaction.pathways || [];
            components.pathways.forEach(function(pathway){
                if(pathway.allReactions.indexOf(reaction) > -1){
                    reaction.pathways.push(pathway);
                }
            });
        });

        //create pathways hierarchy
        components.pathways.forEach(function (pathway) {
            pathway.pathways.forEach(function (p) {
                p.parent = pathway;
            })
        });
        components.pathways.forEach(function (pathway) {
            if(!pathway.parent)
                self.rootPathways.push(pathway);
        });

    };


    return self;
}