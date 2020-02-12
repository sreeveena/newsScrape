//Register on-click events for various buttons after loading of document
$(function () {
  $(document).on("click", "#saveArticle-btn", function (event) {
    // event.preventDefault();
    var id = $(this).data("id");
    $("#" + id).remove();
    saveArticle(id);
  });

  $(document).on("click", "#addNote-btn", function (event) {
    // event.preventDefault();
    var id = $(this).data("id");
    $("#savedArticleModal" + id).modal("show");
    displayNotesList(id);
  });

  // View note commented by user
  $(document).on("click", "#del-btn", function (event) {
    // event.preventDefault();
    var id = $(this).data("id");
    deleteArticle(id);
  });

  $(document).on("click", "#saved", function (event) {
    event.preventDefault();
    location.href = "/pages/saved";
  });

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
        location.href = "/";

      });
    });
  });

});

function showResults(data) {
  $("#newScrapedArticles").modal("toggle");
  $("#scrapedNote").empty();
  $("#scrapedNote").append("<div> You have scraped " + data.result + " new articles!");
}

// sleep time expects milliseconds
function sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

//Save an article
function saveArticle(id) {
  $.ajax("/articles/" + id, {
    type: "PUT"
  }).then(function (data) {
    location.href = '/';
  });
}

function displayNotesList(id) {
  $.ajax("/articles/" + id + "/notes", {
    type: "GET"
  }).then(function (data) {
    var notes = $("#notes" + id);
    notes.empty();
    var notesStr = "<table>";
    if (data.notes.length > 0) {
      for (var i = 0; i < data.notes.length; i++) {
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
  }).then(function (data) {
    console.log("Deleted the row");
  });
}

//Delete note
function deleteArticle(id) {
  $("#savedArticle" + id).remove();
  $("#savedArticleModal" + id).remove();
  $.ajax("/articles/" + id, {
    type: "DELETE"
  }).then(function (data) {
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
function fillNote(id, article) {
  $.ajax("/notes/" + id, {
    type: "GET"
  }).then(function (data) {
    $("input[data-value=" + article + "]").val(data.title);
    $("textarea[data-text=" + article + "]").val(data.body);
  })

}
