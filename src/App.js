import React, { Component } from "react";
import Header from "./Components/Layouts/Header";
import Footer from "./Components/Layouts/Footer";
import Recipes from "./Components/Ingredients/Recipes";
import Ingredients from "./Components/Ingredients";
import { ingredients, foodtypes, recipes } from "./store.js";
import firebase from './firebase.js';
import Modal from"./Components/Layouts/Modal"

export default class extends Component {
    // Allows use of functions
    constructor() {
        super();
        this.state = {
            //tester,
            //temp: [],
                ingredients, // List of ingredients
                foodtypes, // List of foodtypes
                recipes, // List of recipes
                currentIngredients: ingredients, // List of currently displaying ingredients
                selectedFoodTypes: foodtypes, // List of currently displaying foodtypes
                //ingredient: {}, 
                foods: [], // Ingredients user wishes to use    
                showingRecipes: false, // Showing the recipes
                authState: false,
                userId: ""
        };
    }

    // After enter key is pressed puts user input through validation
    pressed = (event) => {
        if (event.key === 'Enter') {
            // Checks user input after enter is pressed
            ingredients.map((ing) => 
                // Compares each ingredient to the user input checking for match
                ing.id === document.getElementById('textInput1').value.toLowerCase()
                    ?
                // If match, update list of ingredients
                this.setState((prevState) => {
                    return { foods: [...prevState.foods, ing.name]}
                })
                // Else do nothing
                    : null
            )
        }
    }

    getIngredientsByFoodtypes() {
        // Seperates the ingredients based on food types
        if (this.state.currentIngredients === null) {
            return null
        } else {
            return Object.entries(
                this.state.currentIngredients.reduce((currentIngredients, ingredient) => {
                    const { foodtypes } = ingredient;
                    // Sees if the ingredient already has a food type
                    currentIngredients[foodtypes] = currentIngredients[foodtypes]
                        // If so adds it to the list of ingredients inside the foodtype
                        ? [...currentIngredients[foodtypes], ingredient]
                        : [ingredient];
                    return currentIngredients;
                }, {})
            );
        }
    }

    handleIngredientSelected = id => {
        // If ingredient isn't already in list add it

        if (!this.state.foods.includes(id)) {
            this.setState((prevState) => {
                return { foods: [...prevState.foods, id] }
            })
        }
    }

    handleRemoveIngredient = food => {
        // Removes ingredient from list
        this.setState((prevState) => {
            prevState.foods.splice(prevState.foods.indexOf(food), 1)
                return {foods: prevState.foods }
        })
    }

    handleShowRecipes = () => {
        // Hides and displays the recipes
        this.setState((prevState) => {
            return { showing: !prevState.showing }
        })
            console.log(this.state.showing)
    }

    handleSearching = () => {
        var hold = []
        // Checks if input is empty
        document.getElementById('userInput1').value
            ?
                // If not empty display ingredients that includes the user input
                this.setState((prevState) => {
                    ingredients.map((ing) =>
                        // Check all ingredients
                        ing.id.includes(document.getElementById('userInput1').value.toLowerCase())
                            ?
                                // If ingredient includes user input add to ingredients to be displayed
                                hold.push(ing)
                            :
                                // Else do nothing
                                null
                    )
                    // Update displayed ingredients
                    if (hold.length > 0) {
                        return { currentIngredients: hold }
                    } else {
                        return { currentIngredients: null }
                    }
                })
            :
                // If empty display all ingredients
                this.setState((prevState) => {
                    return { currentIngredients: ingredients }
                })
    }

    // Links recipe details placeholder
    handleLinkingRecipes = (recipeName) => {
        recipes.map((recipe) => {
            if (recipeName === recipe.name) {
                window.open(recipe.link)
            }
        })
    }

    // Hides food types
    handleHideFoodTypes = (foodType) => {
        if (this.state.selectedFoodTypes.includes(foodType)) {
            // Makes sure foodtype is in foodtypes before removing
            this.setState((prevState) => {
                // Removes the food type from array of foodtypes to display
                prevState.selectedFoodTypes.splice(prevState.selectedFoodTypes.indexOf(foodType), 1)
                return { selectedFoodTypes: prevState.selectedFoodTypes }
            })
        }
    }

    //Shows food types
    handleDisplayFoodTypes = (foodType) => {
        if (!this.state.selectedFoodTypes.includes(foodType)) {
            this.setState((prevState) => {
                return { selectedFoodTypes: [...prevState.selectedFoodTypes, foodType] }
            })
        }
    }

    handleSavingIngredients = (e) => {
        e.preventDefault();
        // saves user ingredients to their fridge
        firebase.database().ref('users/' + this.state.userId).set({
            fridge: this.state.foods
        });
    }

    // -------------- USER AUTH ----------------
    handleLogIn = (e) => {
        // Gets the email and password from user input
        const email = document.getElementById('txtEmail').value;
        const pass = document.getElementById('txtPassword').value;
        // Calls firebases log in function using user email and password
        const auth = firebase.auth();
        const promise = auth.signInWithEmailAndPassword(email, pass);
        // If error prints to console
        // Better to print to screen
        promise.catch(e => console.log(e.message));
    }

    handleSignUp = (e) => {
        // Gets the email and password from user input
        const email = document.getElementById('txtEmail').value;
        const pass = document.getElementById('txtPassword').value;
        // Calls firebases sign up function using user email and password
        const auth = firebase.auth();
        const promise = auth.createUserWithEmailAndPassword(email, pass);
        // If error prints to console
        // Better to print to screen
        promise
            .then(this.createUserDB(email))
            .catch(e => console.log(e.message));
    }

    createUserDB = (email) => {
        // Firebase lags, so once firebase updates create the user's DB
        firebase.auth().onAuthStateChanged(user => {
            var userData = {
                name: "placeholder",
                fridge: ""
            };
            // Creates userDB and fills it with placehpolder information.
            var updates = {};
            updates['/users/' + user.uid] = userData;
            return firebase.database().ref().update(updates);
        })

    }

    handleLogOut = (e) => {
        // Calls fire function to sign out
        firebase.auth().signOut()
        console.log(firebase.auth().currentUser)
    }

    handleLoadFridge = () => {
        var ref = firebase.database().ref("users/" + this.state.userId);
        ref.once("value")
            .then(function (snapshot) {
                var name = snapshot.child("fridge").val();
                this.setState((prevState) => {
                    return { currentIngredients: this.state.userId }
                })
                console.log(name)
            });
    }

    componentDidMount = () => {
        // Incase firebase takes longer than the render
        firebase.auth().onAuthStateChanged((user) => {
            // Grabs UID of user if there one
            if (user) {
                this.setState((prevState) => {
                    return { userId: user.uid }
                })
            } else {
                this.setState((prevState) => {
                    return { userId: "" }
                })
            }
        })
        /*
        let i, j, z = 0;
        console.log(tester.length);
        for (i = 0; i < tester.length; i++) {
            console.log(tester[i].ingredients.length);
            for (j = 0; j < tester[i].ingredients.length; j++) {
                var namer = tester[i].ingredients[j].name;
                var typer = tester[i].ingredients[j].type;
                var namer = namer.trim();
                var ider = namer
                for (z = 0; z < namer.length; z++) {
                    if (namer[z] === " ") {
                        namer = namer.slice(0, z+1) + namer.charAt(z+1).toUpperCase() + namer.slice(z+2);
                    }
                }
                namer = namer.charAt(0).toUpperCase() + namer.slice(1);
                var ing = {
                    name: namer,
                    foodTypes: typer,
                    id: ider
                }
                this.state.temp.push(ing);
            }
        }

        console.log(this.state.temp)



        if (this.state.temp.length === 65) {
            console.log(JSON.stringify({ ingredients: this.state.temp }));
        }
        */

    }

    render() {
        const ingredients = this.getIngredientsByFoodtypes();
        //console.log(ingredients)
        return (
            <div>
                <Header />
                <input
                    type="text"
                    id="textInput1"
                    onKeyPress={this.pressed} />
                {firebase.auth().currentUser
                    ?
                    // Loads logout button and load fridge button
                    <div>
                        <button
                            id="btnLogOut"
                            className="btn btn-secondary"
                            onClick={this.handleLogOut}
                        > Log Out
                        </button>
                        <button
                            id="btnLoadFridge"
                            className="btn btn-secondary"
                            onClick={this.handleLoadFridge}
                        > Load fridge
                        </button>
                    </div>
                    :
                    // Popup container for login
                    <Modal
                        logIn={this.handleLogIn}
                        signUp={this.handleSignUp}
                    />
                }
                <input type="checkbox" />
                {// Button for showing recipes
                }
                <button
                    name="showRecipes"
                    onClick={this.handleShowRecipes}
                >
                    Search for Recipes
                </button>
                {// Button for saving ingredients
                }
                <button
                    name="saveIngredients"
                    onClick={this.handleSavingIngredients}
                >
                    Save ingredients!
                </button>
                {// Calls the Ingredients from index.js in components/Layout
                 // And sets the props
                }
                <Ingredients
                    ingredients={ingredients}
                    selectedFoodTypes={this.state.selectedFoodTypes}
                    foods={this.state.foods}
                    onSelect={this.handleIngredientSelected}
                    onRemoval={this.handleRemoveIngredient}
                    onHide={this.handleHideFoodTypes}
                    onDisplay={this.handleDisplayFoodTypes}
                    searching={this.handleSearching}
                />
                <Footer foodtypes={foodtypes} />
                {this.state.showing
                    // If user wants to display recipes display them
                    ?
                    <Recipes
                        foods={this.state.foods}
                        recipes={this.state.recipes}
                        linkRecipes={this.handleLinkingRecipes}
                    />
                    // Else don't
                    : null
                }
                <p id="demo"></p>
            </div>
        )
    }
}
