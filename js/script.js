var token = '';

// Get current gh-pages username and reponame
var pathArray = window.location.host.split( '.' );
var pathSlash = window.location.pathname.split( '/' ); // pathSlash[1]
var username = pathArray[0];
var reponame = pathSlash[1];

// Check if token is stored
if( localStorage.getItem("token") !== null ){
  // Hide token input field
  document.getElementById("token").style.display = "none";
  // Retrieve token from localStorage
  token = document.getElementById("token").value = localStorage.getItem("token");
  // OAuth
  var github = new Github({
    token: token,
    auth: "oauth"
  });
  // Read repository
  var repo = github.getRepo(username, reponame);
  repo.read('master', 'LOG.md', function(err, data) {
    if(err===null){
      // Append content in textarea
      document.getElementById("body").value = data;
      // Read commits
      repo.getCommits({sha:'master', path:'LOG.md'}, function(err, data){
        // Commits loop
        Object.keys(data).forEach(function(key,index){
          // Create list item, populate and append
          newLi = document.createElement("li");
          newLi.innerHTML = '<a href="'+data[key].html_url+'">'+data[key].commit.message+'</a>';
          document.getElementById("commits").appendChild(newLi);
        });
      },function(err){console.log(err);});
    }else{
      // Display error and remove token from localStorage
      document.getElementsByTagName('section')[0].innerHTML = '<h1>error '+err.error+'</h1><a href="/'+reponame+'">Again</a>';
      localStorage.removeItem('token');
    }
  });
  // Submit handler
  document.getElementById("submit").addEventListener("click",function(){
    // Disable submit button
    document.getElementById('submit').setAttribute("disabled", "true");
    // Retrieve textarea content
    body = document.getElementById("body").value;
    // Write on master branch
    repo.write('master', 'LOG.md', body, 'committed '+new Date(), function(err) {
      if(err===null){
        // Success
        document.getElementsByTagName('section')[0].innerHTML = '<h1>Commit ok</h1><a href="/'+reponame+'">Again</a>';
      }else{
        // Error, remove token
        document.getElementsByTagName('section')[0].innerHTML = '<h1>error '+err.error+'</h1><a href="/'+reponame+'">Again</a>';
        localStorage.removeItem('token');
      }
    });
  },false);
}else{
  // Personal token not stored
  // Hide textarea
  document.getElementById("body").style.display = "none";
  // Submit handler
  document.getElementById("submit").addEventListener("click",function(){
    // Disable submit button
    document.getElementById('submit').setAttribute("disabled", "true");
    // Store token in localStorage and reload page
    localStorage.setItem("token", document.getElementById("token").value);
    window.location.reload();
  },false);
}
