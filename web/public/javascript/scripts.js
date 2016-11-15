var app = angular.module('bloom',['labs.controllers','ngRoute','ngMaterial']);

app.
  config(['$locationProvider', '$routeProvider',
    function config($locationProvider, $routeProvider) {

      $routeProvider.
        when('/chat', {
          templateUrl : 'asset/templates/chat.html',
          controller : 'chatCtrl'
        }).
        when('/files', {
          templateUrl : 'asset/templates/files.html',
          controller : 'filesCtrl'
        }).
        otherwise('/chat');
    }
  ]);

var controller_module = angular.module('labs.controllers', []);

var storage = {
	store : function(key,value) {
		// body...
		if (typeof (Storage) !== "undefined") {
            window.localStorage.setItem(key, value);
        }
	},
	get : function(key) {
		if (typeof (Storage) !== "undefined" && localStorage.getItem(key) !== null) {
			return localStorage.getItem(key);
		} else{
			return false;
		}
	}
}

var progress_bar = {
		show : function(){
			jQuery('[rel="progress_bar"]').removeClass('hide');
		},
		hide : function() {
			jQuery('[rel="progress_bar"]').addClass('hide');
		}
}


controller_module.controller('chatCtrl',["$scope", function($scope) {
  //Set the menu item to active
  jQuery(".item").removeClass('active');
  jQuery('[link=chat]').addClass('active');
  chat_stub.init();
  file_stub.init();
  var window_height = jQuery(window).height();
  jQuery(".main").height(window_height - 120);
}]);


controller_module.controller('filesCtrl',["$scope", function($scope) {
    //Set the menu item to active
    jQuery(".item").removeClass('active');
    jQuery('[link=files]').addClass('active');
    file_stub.init();
    var window_height = jQuery(window).height();
    jQuery(".main").height(window_height-60);
}]);


var chat_stub  = {
	channel : 'politecheese_1',
	subscribe : function() {
			var self = this;
			pubnub.addListener({
		        status: function(statusEvent) {
		            if (statusEvent.category === "PNConnectedCategory") {
		                //self.publish();
										var newState = {
					                name: storage.get("uuid"),
					                timestamp: new Date()
					          };

				            pubnub.setState(
				                {
				                    channels: ["politecheese_1"],
				                    state: newState
				                }
				            );
		            }
		        },
		        message: function(packet) {
		            //console.log("New Message!!", packet);
		            self.addMessage(packet.message);
		        },
		        presence: function(presenceEvent) {
		            // handle presence
								console.log(presenceEvent);
		        }
		    })
		    //console.log("Subscribing..");
		    pubnub.subscribe({
		        channels: [self.channel],
						withPresence: true,
						timeout : 10
		    });
	},
	publish : function(data,is_file) {
		//console.log("Since we're publishing on subscribe connectEvent, we're sure we'll receive the following publish.");
		var self = this;
		var message = jQuery('#content').val();
		var d = new Date();
		//d.setDate(d.getDate()-10);
		var packet = {
			content : data,
			sender : storage.get("uuid"),
			time : d,
			timezone_offset : (new Date()).getTimezoneOffset()
		};
		if(is_file) {
			packet.is_file = true;
		}
    var publishConfig = {
        channel : this.channel,
        message : packet
    };

    pubnub.publish(publishConfig, function(status, response) {
        //console.log(status,response);
        if(status.statusCode == 200){
        	jQuery('#content').val('');
        }
    });
	},
	connect : function(uuid) {
		pubnub = new PubNub({
		        publishKey : 'pub-c-5d1f44f3-e3b1-405d-8d3e-68c351dd4239',
		        subscribeKey : 'sub-c-319e8f88-7772-11e6-9717-0619f8945a4f',
		        uuid : uuid
		});
		this.subscribe();
		this.getHistory();
	},
	bindEvents : function() {
		//console.log('ok')
		var self = this;
		$(document).on("#login",'click',function(){
			//console.log('fine')
			var username = jQuery("#recipient-name").val();
			if(username != undefined && username != '') {
				$("#usermodel").modal('hide');
				self.connect(username);
				storage.set("uuid",username);
			}
		});

		$(document).keypress(function(e) {
		    if(e.which == 13) {
		        self.publish(jQuery('#content').val(),false);
		    }
		});


	},
	init : function() {
		var self = this;
		//storage.set("uuid","harika");
		var value = storage.get("uuid");
		self.bindEvents();
		//if(!value) {
		    //$("#usermodel").modal('show');
		//} else {
		    self.connect(value);
		//}
	},
	addMessage : function(message) {
		var self = this;
		var date = new Date(message.time);
		var key = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
		var markup = self.getEntryMarkup(message);

		if(!self.sorted_messages.hasOwnProperty(key)) {
			$("[rel=chat]").append('<div class="date_seperator">' + moment(date).format('Do MMM') + '</div>');
		}

		$("[rel=chat]").append(markup);
		/*
		$('html, body').animate({
            scrollTop: $("[rel=chat]").offset().bottom
        }, 2000);
        */
	},
	addListOfMessages : function(messages) {
		var list = '';
		var self = this;
		self.sorted_messages = {};
		$.each(messages,function(idx,el) {
			if(jQuery.isPlainObject(el.entry)) {
				//console.log(el.entry)
				var date = new Date(el.entry.time);
				var key = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
				if(!self.sorted_messages.hasOwnProperty(key)) {
					self.sorted_messages[key] = [];
				}
				//list += self.getEntryMarkup(el.entry);
				self.sorted_messages[key].push(self.getEntryMarkup(el.entry))
			}
		});
		$.each(_.keys(self.sorted_messages),function(idx,el) {
				list += '<div class="date_seperator">' + moment(el).format('Do MMM') + '</div>';
				$.each(self.sorted_messages[el],function(i,markup) {
						list += markup;
				});
		});

		$("[rel=chat]").append(list);
	},
	getEntryMarkup : function(message) {

		var current_user = storage.get("uuid");
		var time = moment(message.time).format('h:mm a');
		var tmpl = '';
		if(message.is_file == undefined || !message.is_file) {
			if(current_user == message.sender){
				  tmpl = '<div class="text_message me">';
					tmpl += '' + message.content + '<div class="time">' + time +'</div>';
					tmpl +=	'</div>';
			} else {
				  tmpl = '<div class="text_message other">';
					tmpl += '' + message.content + '<div class="time">' + time +'</div>';
					tmpl +=	'</div>';
			}
		} else {
			if(current_user == message.sender) {
					tmpl = '<div class="text_message me">';
					tmpl += '<a target="_blank" href="' + message.content + '">' +'<img class="file_preview" style="" src="' + message.content + '"></img></a>';
					tmpl += '<div class="time">' + time +'</div>';
					tmpl +=	'</div>';
			} else {
					tmpl = '<div class="text_message other">';
					tmpl += '<a target="_blank" href="' + message.content + '">' +'<img class="file_preview" style="" src="' + message.content + '"></img></a>';
					tmpl += '<div class="time">' + time +'</div>';
					tmpl +=	'</div>';
			}

		}
		return tmpl;
	},
	getHistory : function() {
		var self = this;
		pubnub.history({
	        channel: self.channel,
	        reverse: true, // true to send via post
	        count: 100 ,// how many items to fetch,
					'stringifiedTimeToken' : true,
	    },
	    function (status, response) {
	        // handle status, response
	        if(status.statusCode == 200) {
	        	self.addListOfMessages(response.messages);
	        }
	    });
	}
};

//jQuery(document).ready(function(){
	//chat_stub.init();
//});

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
               //console.log(file);
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
      self.is_files_tab = jQuery("[link=files]").hasClass('active');
      if(self.is_files_tab) {
          self.populateFilesView();
      }
  }
}
