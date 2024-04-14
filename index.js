// Ouvrir ou créer une base de données
var request = indexedDB.open('Cocktail', 1);
var db;

request.onerror = function(event) {
  console.log("Erreur lors de l'ouverture de la base de données");
};
request.onsuccess = function(event) {
  console.log("Base de données ouverte avec succès");
  db = event.target.result;

  // Remplir les listes déroulantes
  remplirAlcools();
  remplirDilluants();

  // Autres opérations sur la base de données...
};

// Gérer la mise à jour de la base de données (création de l'objet store, ajout d'index, etc.)
request.onupgradeneeded = function(event) {
  var db = event.target.result;

  // Créer la structure de la base de données si nécessaire
  var cocktailStore = db.createObjectStore("cocktail", { keyPath: "id", autoIncrement: true });
  cocktailStore.createIndex("nom", "nom", { unique: true });

  var alcoolStore = db.createObjectStore("alcool", { keyPath: "id", autoIncrement: true });
  alcoolStore.createIndex("nom", "nom", { unique: true });

  var dilluantStore = db.createObjectStore("dilluant", { keyPath: "id", autoIncrement: true });
  dilluantStore.createIndex("nom", "nom", { unique: true });

  var cocktailAlcoolStore = db.createObjectStore("CocktailAlcool", { keyPath: ["cocktail_id", "alcool_id", "dilluant_id"] });
  cocktailAlcoolStore.createIndex("cocktail_id", "cocktail_id");
  cocktailAlcoolStore.createIndex("alcool_id", "alcool_id");
  cocktailAlcoolStore.createIndex("dilluant_id", "dilluant_id");

  console.log("Base de données mise à jour avec succès");

  // Insérer les données initiales
  insereDonneesInitiales(db);
};


// Fonction pour insérer les données initiales
function insereDonneesInitiales(db) {
  var transaction = db.transaction(["cocktail", "alcool", "dilluant", "CocktailAlcool"], "readwrite");

  // Insérer les données dans la table cocktail
  var cocktailStore = transaction.objectStore("cocktail");
  cocktailStore.add({ nom: 'Cuba Libre' });
  cocktailStore.add({ nom: 'Vodka Red Bull' });
  cocktailStore.add({ nom: 'Whisky Coca' });

  // Insérer les données dans la table alcool
  var alcoolStore = transaction.objectStore("alcool");
  alcoolStore.add({ nom: 'Rhum' });
  alcoolStore.add({ nom: 'Whisky' });
  alcoolStore.add({ nom: 'Vodka' });

  // Insérer les données dans la table dilluant
  var dilluantStore = transaction.objectStore("dilluant");
  dilluantStore.add({ nom: 'Coca' });
  dilluantStore.add({ nom: 'Jus de pomme' });
  dilluantStore.add({ nom: 'Red Bull' });

  // Insérer les données dans la table CocktailAlcool
  var cocktailAlcoolStore = transaction.objectStore("CocktailAlcool");
  cocktailAlcoolStore.add({ cocktail_id: 1, alcool_id: 1, dilluant_id: 1 });
  cocktailAlcoolStore.add({ cocktail_id: 3, alcool_id: 2, dilluant_id: 1 });
}


function getAlcools(callback) {
  var alcools = [];
  var transaction = db.transaction(["alcool"], "readonly");
  var objectStore = transaction.objectStore("alcool");
  var request = objectStore.getAll();

  request.onsuccess = function(event) {
    alcools = event.target.result;

    // Vérifier que la table alcool contient des données
    if (alcools.length > 0) {
      callback(alcools);
    } else {
      console.log("La table alcool est vide");
    }
  };

  transaction.onerror = function(event) {
    console.log("Erreur lors de la récupération des alcools");
  };
}


function getDilluants(callback) {
  var dilluants = [];
  var transaction = db.transaction(["dilluant"], "readonly");
  var objectStore = transaction.objectStore("dilluant");
  var request = objectStore.getAll();

  request.onsuccess = function(event) {
    dilluants = event.target.result;

    // Vérifier que la table alcool contient des données
    if (dilluants.length > 0) {
      callback(dilluants);
    } else {
      console.log("La table dilluant est vide");
    }
  };

  transaction.onerror = function(event) {
    console.log("Erreur lors de la récupération des dilluants");
  };
}




function remplirAlcools() {
  var select = document.getElementById("alcool-select");

  // Ajouter une option par défaut
  var option = document.createElement("option");
  option.text = "Alcool";
  option.disabled = true;
  option.selected = true;
  select.add(option);

  getAlcools(function(alcools) {
    alcools.forEach(function(alcool) {
      var option = document.createElement("option");
      option.text = alcool.nom;
      select.add(option);
    });

    // Afficher les données récupérées dans la console
    console.log("Alcools récupérés :", alcools);
  });
}

function remplirDilluants() {
  var select = document.getElementById("dilluant-select");

  // Ajouter une option par défaut
  var option = document.createElement("option");
  option.text = "Dilluant";
  option.disabled = true;
  option.selected = true;
  select.add(option);

  getDilluants(function(dilluants) {
    dilluants.forEach(function(dilluant) {
      var option = document.createElement("option");
      option.text = dilluant.nom;
      select.add(option);
    });

    // Afficher les données récupérées dans la console
    console.log("Dilluants récupérés :", dilluants);
  });
}

function ajouterAlcool() {
  var select = document.getElementById("alcool-select");
  var alcool = select.options[select.selectedIndex].text;

  // Vérifier si l'alcool existe déjà dans la liste
  var list = document.getElementById("selection-list");
  var existeDeja = false;
  for (var i = 0; i < list.children.length; i++) {
    if (list.children[i].textContent === alcool) {
      existeDeja = true;
      break;
    }
  }

  if (!existeDeja) {
    var li = document.createElement("li");
    li.textContent = alcool;

    // Ajouter un bouton Supprimer
    var boutonSupprimer = document.createElement("button");
    boutonSupprimer.textContent = "Supprimer";
    boutonSupprimer.onclick = function() {
      list.removeChild(li);
    };
    li.appendChild(boutonSupprimer);

    list.appendChild(li);
  } else {
    alert("Cet alcool a déjà été ajouté.");
  }
}


function ajouterDilluant() {
  var select = document.getElementById("dilluant-select");
  var dilluant = select.options[select.selectedIndex].text;

  // Vérifier si le dilluant existe déjà dans la liste
  var list = document.getElementById("selection-list");
  var existeDeja = false;
  for (var i = 0; i < list.children.length; i++) {
    if (list.children[i].textContent === dilluant) {
      existeDeja = true;
      break;
    }
  }

  if (!existeDeja) {
    var li = document.createElement("li");
    li.textContent = dilluant;

    // Ajouter un bouton Supprimer
    var boutonSupprimer = document.createElement("button");
    boutonSupprimer.textContent = "Supprimer";
    boutonSupprimer.onclick = function() {
      list.removeChild(li);
    };
    li.appendChild(boutonSupprimer);

    list.appendChild(li);
  } else {
    alert("Ce dilluant a déjà été ajouté.");
  }
}


function rechercher() {
  // Récupérer les sélections de l'utilisateur
  var alcools = [];
  var dilluants = [];
  var selectAlcools = document.getElementById("alcool-select");
  var selectDilluants = document.getElementById("dilluant-select");
  for (var i = 0; i < selectAlcools.options.length; i++) {
    if (selectAlcools.options[i].selected) {
      alcools.push(selectAlcools.options[i].value);
    }
  }
  for (var i = 0; i < selectDilluants.options.length; i++) {
    if (selectDilluants.options[i].selected) {
      dilluants.push(selectDilluants.options[i].value);
    }
  }

  console.log("Alcools sélectionnés :", alcools);
  console.log("Dilluants sélectionnés :", dilluants);

  // Effectuer la recherche
  var transaction = db.transaction(["CocktailAlcool"], "readonly");
  var objectStore = transaction.objectStore("CocktailAlcool");
  var index = objectStore.index("alcool_id");
  var request = index.openCursor();
  var results = [];

  request.onsuccess = function(event) {
    var cursor = event.target.result;
    if (cursor) {
      var alcool = cursor.value.alcool_id;
      var dilluant = cursor.value.dilluant_id;

      if (alcools.indexOf(alcool) !== -1 && dilluants.indexOf(dilluant) !== -1) {
        results.push(cursor.value.cocktail_id);
        cursor.continue();
      } else {
        cursor.continue();
      }
    } else {
      // Afficher les résultats
      var textarea = document.getElementById("results");
      if (results.length > 0) {
        textarea.value = results.join("\n");
      } else {
        textarea.value = "Aucun cocktail trouvé";
      }
    }
  };

  transaction.onerror = function(event) {
    console.log("Erreur lors de la recherche du cocktail");
  };
}




function reinitialiser() {
  // Réinitialiser les listes déroulantes
  var selectAlcools = document.getElementById("alcool-select");
  var selectDilluants = document.getElementById("dilluant-select");
  for (var i = 0; i < selectAlcools.options.length; i++) {
    selectAlcools.options[i].selected = false;
  }
  for (var i = 0; i < selectDilluants.options.length; i++) {
    selectDilluants.options[i].selected = false;
  }

  // Réinitialiser la liste des sélections
  var list = document.getElementById("selection-list");
  while (list.firstChild) {
    list.removeChild(list.firstChild);
  }

  // Réinitialiser la textarea
  var textarea = document.getElementById("results");
  textarea.value = "";
}