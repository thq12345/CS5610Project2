const commentsDiv = document.querySelector("#feedback_content");

async function loadComments() {
  console.log("Start loading comments.");
  commentsDiv.innerHTML = "";
  let comment_text;
  let res;
  try {
    res = await fetch("/comment-text-update");
    if (!res.ok) {
      console.log("Fetching from initial source /comment-text");
      res = await fetch("/comment-text");
    }
    comment_text = await res.json();
    console.log("Here is retrieved comment from back end:");
    console.log(comment_text);
  } catch (e) {
    commentsDiv.innerHTML = "You have not logged in!";
  }

  try {
    let count = 0;
    for (let text of comment_text) {
      const tr = document.createElement("tr");
      tr.innerHTML = `<tr id="feedbackmain${count}">
  <th scope="row" id="feedbackindex${count}">${count + 1}</th>
  <td id="userentry${count}">${text.user}</td>
    <td id="feedbackdate${count}">${text.subject}</td>
  <td id="feedbacktextbox${count}">${text.comment}</td>

  <td>
    <button
            type="button"
            class="btn btn-primary"
            data-toggle="modal"
            data-target="#exampleModal${count}"
            data-whatever="@fat"
            id="editdeletebutton${count}"
    >
      Edit or Delete message
    </button>
    <div
            class="modal fade"
            id="exampleModal${count}"
            tabindex="-1"
            role="dialog"
            aria-labelledby="exampleModalLabel"
            aria-hidden="true"
    >
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLabel">
              Edit or Delete message
            </h5>
            <button
                    type="button"
                    class="close"
                    data-dismiss="modal"
                    aria-label="Close"
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <form id="Comment Modification Form" action="http://127.0.0.1:3000/feedback-edit" method="POST">
              <div class="form-group">
                <label for="message-text" class="col-form-label">Subject:</label>
                <textarea
                        class="form-control"
                        id="message-text"
                        name="textsubject">${text.subject}</textarea>
                <label for="message-text" class="col-form-label">Message:</label>
                <textarea
                        class="form-control"
                        id="message-text"
                        name="textarea">${text.comment}</textarea>
                
              </div>
              <div class="modal-footer">
              <input type="hidden" name="originaltext" value="${text._id}" >
            <button class="btn btn-primary" type="submit" onclick="editFeedback(${count})">
              Edit
            </button>
            <button class="btn btn-primary" type="submit" formaction="http://127.0.0.1:3000/feedback-delete" onclick="deleteFeedback(${count}, ${comment_text})">
              Delete
            </button>
          </div>
            </form>
          </div>
<!--          <div class="modal-footer">-->
<!--            <button type="button" class="btn btn-primary">-->
<!--              Edit-->
<!--            </button>-->
<!--            <button type="button" class="btn btn-primary">-->
<!--              Delete-->
<!--            </button>-->
<!--          </div>-->
        </div>
      </div>
    </div>
  </td>
</tr>`;
      commentsDiv.appendChild(tr);
      count += 1;
    }
  } catch (e) {}
}

loadComments();

function deleteFeedback(location, comment_text) {
  console.log("Delete Feedback Signal Received!" + location);
  let id = document.querySelector(`#feedbackindex${location}`).remove();
  let textbox = document.querySelector(`#feedbacktextbox${location}`).remove();
  let date = document.querySelector(`#feedbackdate${location}`).remove();
  let button = document.querySelector(`#editdeletebutton${location}`).remove();
  let user = document.querySelector(`#userentry${location}`).remove();
}

function editFeedback(location) {
  console.log("Edit Feedback Textbox Signal Received!" + location);
  let textbox = document.querySelector(`#feedbacktextbox${location}`).innerHTML;
  let subject = document.querySelector(`#userentry${location}`).innerHTML;
  // console.log(document.querySelector("#textarea").innerHTML);
}
