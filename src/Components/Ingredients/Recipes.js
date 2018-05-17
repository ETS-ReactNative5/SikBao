import React, { Fragment } from 'react';
import { List } from 'material-ui';
import { ListItem, ListItemText } from 'material-ui/List';
// Displays recipes based on ingredients selected
export default ({ recipes, foods, linkRecipes }) => (
    <Fragment>

        <List component="ul">
            {foods.map((name) =>
                // ^ Gets all the ingredients currently selected
                recipes.map((recipe) =>
                    // Checks each recipe to see if ingredient is in it
                    recipe.ingredientID.includes(name)
                        ?
                        // If it is print that recipe
                        < ListItem button key={recipe.name}>
                                <ListItemText
                                primary={recipe.name}
                                onClick={() => linkRecipes(recipe.name)}/>
                        </ListItem>
                        : null // If not then don't
                    
                
                )
            )}
            </List>
    </Fragment>
);