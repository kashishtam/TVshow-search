function ReviewModel(){
    var review = document.getElementById("txt_review");
    var title = document.getElementsByID('show_title');
    console.log("Hello log" + title);
    document.getElementsByName("title")[0].placeholder= title;
}
$('#myModal').on('shown.bs.modal', function (e) {
    var review = document.getElementById("txt_review");
    var title = document.getElementsByID('show_title');
    console.log("Hello log" + title);
    document.getElementsByName("title")[0].placeholder= title;
  })