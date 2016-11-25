var file_stub = {
  bindEvents : function() {
      var self = this;
      jQuery('#file').on('change',function(ev) {
          self.handleFileSelect(ev);
          jQuery(this).disabled = true;
      });

      jQuery("[rel=upload]").on('click',function(){
          jQuery('#file').click();
      });

      auth.onAuthStateChanged(function(user) {
        if (user) {
          //console.log('Anonymous user signed-in.', user);
          jQuery('#file').disabled = false;
        } else {
          //console.log('There was no anonymous session. Creating a new anonymous user.');
          // Sign the user in anonymously since accessing Storage requires the user to be authorized.
          auth.signInAnonymously();
        }
      });
  },
  populateFilesView : function() {
    var self = this;
    self.sorted_files = {};

    if(location.href.indexOf("files") > -1) {
        progress_bar.show();
        var ref = firebase.database().ref().child('files');
        var list = '';

        ref.on("value", function(snapshot) {
           var files = snapshot.val();
           var keys = _.keys(snapshot.val()).reverse();
           //jQuery("[rel=blocks]").empty();

           var no_of_files = keys.length;
           jQuery("[rel=file_count]").html(no_of_files + " files");

           if(no_of_files == 0) {
             jQuery(".empty_files").removeClass('hide');
           } else {
             jQuery(".empty_files").addClass('hide');
           }

           for(i =0;i < keys.length;i++) {
               var file = files[keys[i]];
               var date = new Date(file.date);
               var key = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
               if(!self.sorted_files.hasOwnProperty(key)) {
                 self.sorted_files[key] = [];
               }
               self.sorted_files[key].push(self.getEntryMarkup(file))
           }

           $.each(_.keys(self.sorted_files),function(idx,el) {
       				list += '<div class="date_seperator">' + moment(el).format('Do MMM') + '</div>';
       				$.each(self.sorted_files[el],function(i,markup) {
       						list += markup;
       				});
       		 });
           jQuery("[rel=blocks]").html(list);

           /*
           for(i =0;i < keys.length;i++) {
               var file = files[keys[i]];
               console.log(file);
               if(file.url.indexOf('pdf') != -1 ) {
                  jQuery("[rel=blocks]").append(self.other_template({file : file, type : 'pdf' }));
               }else if(file.url.indexOf('txt') != -1) {
                  jQuery("[rel=blocks]").append(self.other_template({file : file, type : 'text' }));
               } else {
                  jQuery("[rel=blocks]").append(self.img_template(file));
               }
           }
           */
           progress_bar.hide();

           /*
           $('[rel=blocks] a.preview_possible').embedly({
             key: '45600eb833734f9a868ca8ff6966edd4',
             width: 400
           });
           */
        }, function (errorObject) {
            //console.log("The read failed: " + errorObject.code);
        });
    }
  },
  getEntryMarkup : function(file) {
    var self = this;
    if(file.url.indexOf('pdf') != -1 ) {
       return (self.other_template({file : file, type : 'pdf' }));
    }else if(file.url.indexOf('txt') != -1) {
       return (self.other_template({file : file, type : 'text' }));
    } else {
       return (self.img_template(file));
    }
  },
  updateFileList : function(url,metadata) {
        var self = this;
        // A post entry.
        var postData = metadata;
        postData['author'] = self.profile.nickname;
        postData['date'] = (new Date()).toISOString();
        postData['url'] = url;
        // Get a key for a new Post.
        var newPostKey = firebase.database().ref().child('files').push(postData).key;
        if(!self.is_files_tab){
            chat_stub.publish(url,true);
        }
  },
  handleFileSelect : function(evt) {
      var self = this;

      evt.stopPropagation();
      evt.preventDefault();
      var file = evt.target.files[0];
      var metadata = {
        'contentType': file.type,
        'name' : file.name,
        'date' : new Date()
      };

      var uploadTask = storageRef.child('images/' + file.name).put(file, metadata);
      /*.then(function(snapshot) {
          //console.log(snapshot.metadata);
          var url = snapshot.metadata.downloadURLs[0];
          //console.log('File available at', url);
          self.updateFileList(url);
        }).catch(function(error) {
            console.error('Upload failed:', error);
            progress_bar.hide();
        });*/

        uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
              function(snapshot) {
                // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                var progress = Math.floor((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                jQuery("[rel=file_count],[rel=status]").html(progress + '% uploading...');
              }, function(error) {
                progress_bar.hide();
                jQuery("[rel=file_count]").html('Failed. Try Again');
              }, function() {
                // Upload completed successfully, now we can get the download URL
                var downloadURL = uploadTask.snapshot.downloadURL;
                //var url = snapshot.metadata.downloadURLs[0];
                self.updateFileList(downloadURL,metadata);
            });
  },
  precompileTemplates : function(){
    var self = this;

		var source   = $("#img_template").html();
		self.img_template = Handlebars.compile(source);

		source   = $("#other_template").html();
		self.other_template = Handlebars.compile(source);
	},
  init : function(profile) {
      var self = this;
      auth = firebase.auth();
      self.profile = profile;
      storageRef = firebase.storage().ref();
      self.bindEvents();
      self.is_files_tab = location.href.indexOf("files") > -1 ? true : false;
      if(self.is_files_tab) {
          self.populateFilesView();
          self.precompileTemplates();
      }
  }
}
