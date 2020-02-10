$(function () {
  $("#scrape").on("click", function (event) {
    event.preventDefault();
    $.ajax({
      method: "GET",
      url: "/scrape"
    }).then(function (data) {
      showResults(data);
      // Usage!
      sleep(5000).then(() => {
        // Do something after the sleep!

        $.ajax({
          method: "GET",
          url: "/articles"
        }).then(function (data) {
          
          fetchAndDisplayStoredArticles(data);
        });
      });
    });
  });

  $("#saved").on("click", function (event) {
    event.preventDefault();
    $.ajax({
      method: "GET",
      url: "/articles?saved=true"
    }).then(function (data) {

      displaySavedArticles(data);

    });
  });

  fetchAndDisplayStoredArticles();

});

function showResults(data) {
  $("#newScrapedArticles").modal("toggle");
  $("#scrapedNote").empty();
  $("#scrapedNote").append("<div> You have scraped " + data.result + " new articles!");
}

//Display stored articles 
function fetchAndDisplaySavedArticles() {
  $.ajax({
    method: "GET",
    url: "/articles?saved=true"
  }).then(function (data) {

    displaySavedArticles(data);
  });
}

// sleep time expects milliseconds
function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

//Display stored articles 
function fetchAndDisplayStoredArticles() {
  $.ajax({
    method: "GET",
    url: "/articles?saved=false"
  }).then(function (data) {
    displayStoredArticles(data);
  });
}

//Display all the stored (unsaved) articles
function displayStoredArticles(data) {
  $(".my-container").empty();
  var table = "";
  table = '<div class="row"><div class="col-md-1"></div><div class="col-md-10">';
  var elementStr = "";
  for (var i = 0; i < data.length; i++) {

    elementStr = `
    <div class="card d-inline-flex flex-row bd-highlight mb-3 text-wrap article" id="${data[i]._id}">
      <div class="card-body article">
          <h5 class="card-title">${data[i].title}</h5>
          <p class="card-text" style="word-wrap: break-word"><a href="${data[i].link}">${data[i].link}</a></p>
          <p class="card-text text-wrap">${data[i].para}</p>
          <button type="button" class="btn btn-success" id="saveArticle-btn" data-id="${data[i]._id}">Save Article</button>
      </div>
    </div>
    
    `;
    table += elementStr;
  }

  table = table + '</div><div class="col-md-1"></div></div>';
  $(".my-container").append(table);
  // Add a note button triggering a modal
  $(document).on("click", "#saveArticle-btn", function (event) {
    // event.preventDefault();
    var id = $(this).data("id");
    $("#" + id).remove();
    saveArticle(id);
  });

}

//Save an article
function saveArticle(id) {
  $.ajax("/articles/" + id, {
    type: "PUT"
  }).then(function (data) {
    location.href = '/';
  });
}

//Display saved articles
function displaySavedArticles(data) {
  $(".my-container").empty();
  var table = "";
  table = '<div class="row"><div class="col-md-1"></div><div class="col-md-10">';
  var elementStr = "";
  for (var i = 0; i < data.length; i++) {

    elementStr = `
    <div class="card d-inline-flex flex-row bd-highlight mb-3 text-wrap article" id="savedArticle${data[i]._id}">
      <div class="card-body article">
          <h5 class="card-title">${data[i].title}</h5>
          <p class="card-text" style="word-wrap: break-word"><a href="${data[i].link}">${data[i].link}</a></p>
          <p class="card-text text-wrap">${data[i].para}</p>
          <button type="button" class="btn btn-primary" id="addNote-btn" data-id="${data[i]._id}">Add Note</button>
          <button type="button" class="btn btn-danger" id="del-btn" data-id="${data[i]._id}">Delete Article</button>
      </div>
    </div>

    <div class="modal fade" id="savedArticleModal${data[i]._id}" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel"
        aria-hidden="true">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="name" +"${data[i]._id}">Add a Note</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <input class="form-control" type="text" placeholder="Enter title" data-value=${data[i]._id}><br>
            <textarea class="form-control note text-dark" placeholder="Enter note text" rows="2" data-text=${data[i]._id}></textarea>
            <br>
            <div id="notes${data[i]._id}"></div>
          </div>
          <div class="modal-footer">
            <h5 class="modal-title">Click the note to read or X to delete it</h5>
            <button onclick="addNote('${data[i]._id}')" type="button" class="btn btn-primary" >Save Note</button>
          </div>
        </div>
      </div>
    </div>
    
    `;
    table += elementStr;
  }

  table = table + '</div><div class="col-md-1">.</div></div>';
  $(".my-container").append(table);

  // Add a note button triggering a modal
  $(document).on("click", "#addNote-btn", function (event) {
    // event.preventDefault();
    var id = $(this).data("id");
    $("#savedArticleModal" + id).modal("toggle");
    displayNotesList(id);
  });

  // View note commented by user
  $(document).on("click", "#del-btn", function (event) {
    // event.preventDefault();
    var id = $(this).data("id");
    deleteArticle(id);
  });
  

}

function displayNotesList(id) {
  $.ajax("/articles/" + id + "/notes", {
    type: "GET"
  }).then(function (data) {
    var notes = $("#notes" + id);
    notes.empty();
    var notesStr = "<table>";
    if(data.notes.length > 0) {
      for(var i = 0; i < data.notes.length; i++) {
        notesStr = notesStr + `
          <tr id="note${data.notes[i]._id}">
            <td><a href="javascript:fillNote('${data.notes[i]._id}','${id}')">${data.notes[i].title}</a></td>
            <td><a href="javascript:deleteNote('${data.notes[i]._id}')"> X </a></td>
          </tr>
        `;
      }
      notesStr = notesStr + "</table>";
      notes.append(notesStr);
    }
  });
}

//Delete note
function deleteNote(id) {
  $("#note" + id).remove();
  $.ajax("/notes/" + id, {
    type: "DELETE"
  }).then(function(data) {
    console.log("Deleted the row");
  });
}

//Delete note
function deleteArticle(id) {
  $("#savedArticle" + id).remove();
  $("#savedArticleModal" + id).remove();
  $.ajax("/articles/" + id, {
    type: "DELETE"
  }).then(function(data) {
    fetchAndDisplaySavedArticles();
  });
}

    // Function to add a note post notes to collections
function addNote(id) {
    event.preventDefault();
    var name = $("input[data-value=" + id + "]").val();
    var body = $("textarea[data-text=" + id + "]").val();

    $.ajax("/articles/" + id + "/notes", {
        type: "POST",
        data: {
            title: name,
            body: body
        }
    }).then(function (data) {
        $("input[data-value=" + id + "]").val("");
        $("textarea[data-text=" + id + "]").val("");
        displayNotesList(id);
    })
}

    // Route to get notes commented by user
function fillNote(id,article) {
  $.ajax("/notes/" + id, {
      type: "GET"
  }).then(function (data) {
      $("input[data-value=" + article + "]").val(data.title);
      $("textarea[data-text=" + article + "]").val(data.body);
  })

}


