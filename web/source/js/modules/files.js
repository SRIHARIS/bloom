var file_stub = {
  bindEvents : function() {
      var self = this;
      jQuery('#file').on('change',function(ev) {
          progress_bar.show();
          self.handleFileSelect(ev);
          jQuery(this).disabled = true;
      });

      jQuery("[rel=upload]").on('click',function(){
          jQuery('#file').click();
      });

      auth.onAuthStateChanged(function(user) {
        if (user) {
          console.log('Anonymous user signed-in.', user);
          jQuery('#file').disabled = false;
        } else {
          console.log('There was no anonymous session. Creating a new anonymous user.');
          // Sign the user in anonymously since accessing Storage requires the user to be authorized.
          auth.signInAnonymously();
        }
      });
  },
  populateFilesView : function() {

    if(location.href.indexOf("files") > -1) {

        progress_bar.show();
        var ref = firebase.database().ref().child('files');
        ref.on("value", function(snapshot) {
          //console.log(snapshot.val());
           var files = snapshot.val();
           keys = _.keys(snapshot.val()).reverse();
           jQuery("[rel=blocks]").empty();

           var no_of_files = keys.length;
           jQuery("[rel=file_count]").html(no_of_files + " files");

           for(i =0;i<keys.length;i++) {
               var file = files[keys[i]];
               console.log(file);
               if(file.url.indexOf('pdf') == -1) {
                  jQuery("[rel=blocks]").append('<a href="' + file.url + '"></a>');
               }
           }
           progress_bar.hide();
           $('[rel=blocks] a').embedly({
             key: '45600eb833734f9a868ca8ff6966edd4',
             width: 400
           });
        }, function (errorObject) {
          console.log("The read failed: " + errorObject.code);
        });
    }
  },
  updateFileList : function(url) {
        // A post entry.
        var postData = {
          author: 'SH',
          date : new Date(),
          url : url
        };

        // Get a key for a new Post.
        var newPostKey = firebase.database().ref().child('files').push(postData).key;
  },
  handleFileSelect : function(evt) {
    var self = this;

    evt.stopPropagation();
    evt.preventDefault();
    var file = evt.target.files[0];
    var metadata = {
      'contentType': file.type
    };
    // Push to child path.
    // [START oncomplete]
    storageRef.child('images/' + file.name).put(file, metadata).then(function(snapshot) {
      //console.log('Uploaded', snapshot.totalBytes, 'bytes.');
      console.log(snapshot.metadata);
      var url = snapshot.metadata.downloadURLs[0];
      console.log('File available at', url);
      self.updateFileList(url);
    }).catch(function(error) {
      // [START onfailure]
      console.error('Upload failed:', error);
      progress_bar.hide();
      // [END onfailure]
    });
    // [END oncomplete]
  },
  init : function() {
      var self = this;
      auth = firebase.auth();
      storageRef = firebase.storage().ref();
      self.bindEvents();
      self.populateFilesView();
  }
}
