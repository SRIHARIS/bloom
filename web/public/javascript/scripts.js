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

controller_module.controller('chatCtrl',["$scope", function($scope) {
  //Set the menu item to active
  jQuery(".item").removeClass('active');
  jQuery('[link=chat]').addClass('active');
  chat_stub.init();
}]);


controller_module.controller('filesCtrl',["$scope", function($scope) {
    //Set the menu item to active
    jQuery(".item").removeClass('active');
    jQuery('[link=files]').addClass('active');
    file_stub.init();
}]);


var chat_stub  = {
	channel : 'politecheese',
	subscribe : function() { 
			var self = this;
			pubnub.addListener({
		        status: function(statusEvent) {
		            if (statusEvent.category === "PNConnectedCategory") {
		                //self.publish();
		            }
		        },
		        message: function(packet) {
		            console.log("New Message!!", packet);
		            self.addMessage(packet.message);
		        },
		        presence: function(presenceEvent) {
		            // handle presence
		        }
		    })      
		    console.log("Subscribing..");
		    pubnub.subscribe({
		        channels: [self.channel] 
		    });
	},
	publish : function() {
		//console.log("Since we're publishing on subscribe connectEvent, we're sure we'll receive the following publish.");
		var self = this;
		var message = jQuery('#content').val();
		var packet = {
			content : message,
			sender : storage.get("uuid")
		}
        var publishConfig = {
            channel : this.channel,
            message : packet
        };

        pubnub.publish(publishConfig, function(status, response) {
            console.log(status,response);
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
		console.log('ok')
		var self = this;
		$(document).on("#login",'click',function(){
			console.log('fine')
			var username = jQuery("#recipient-name").val();
			if(username != undefined && username != '') {
				console.log('fck')
				$("#usermodel").modal('hide');
				self.connect(username);
				storage.set("uuid",username);
			}
		});

		$(document).keypress(function(e) {
		    if(e.which == 13) {
		        self.publish();
		    }
		});
	},
	init : function() {
		var self = this;
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
		$("[rel=chat]").append(self.getEntryMarkup(message));
		/*
		$('html, body').animate({
            scrollTop: $("[rel=chat]").offset().bottom
        }, 2000);
        */
	},
	addListOfMessages : function(messages) {
		var list = '';
		var self = this;

		$.each(messages,function(idx,el) {
			console.log(el);
			if(jQuery.isPlainObject(el.entry)){
				list += self.getEntryMarkup(el.entry);	
			}
		});
		$("[rel=chat]").append(list);
	},
	getEntryMarkup : function(message) {
		var current_user = storage.get("uuid");
		if(current_user == message.sender){
			var tmpl = '<div class="text_message me">';
		    tmpl += '' + message.content + '';
		    tmpl +=	'</div>';
		} else {
			var tmpl = '<div class="text_message other">';
		    tmpl += '' + message.content + '';
		    tmpl +=	'</div>';
		}
		return tmpl;
	},
	getHistory : function() {
		var self = this;
		pubnub.history({
	        channel: self.channel,
	        reverse: true, // true to send via post
	        count: 100, // how many items to fetch
	        includeTimetoken: true // include time token for each item.
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
          self.handleFileSelect(ev);
          jQuery(this).disabled = true;
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
        console.log('in')
        var ref = firebase.database().ref().child('files');
        ref.on("value", function(snapshot) {
          //console.log(snapshot.val());
          var files = snapshot.val();
           keys = _.keys(snapshot.val());
           for(i =0;i<keys.length;i++){
             var file = files[keys[i]];
             console.log(file.url);
             jQuery("[rel=blocks]").append('<a href="' + file.url + '"></a>');

             $('[rel=blocks] a').embedly({
               key: '45600eb833734f9a868ca8ff6966edd4',
               query: {
                 maxwidth: 530
               }
             });

           }
        }, function (errorObject) {
          console.log("The read failed: " + errorObject.code);
        });

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
      console.log('Uploaded', snapshot.totalBytes, 'bytes.');
      console.log(snapshot.metadata);
      var url = snapshot.metadata.downloadURLs[0];
      console.log('File available at', url);
      self.updateFileList(url);
    }).catch(function(error) {
      // [START onfailure]
      console.error('Upload failed:', error);
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
