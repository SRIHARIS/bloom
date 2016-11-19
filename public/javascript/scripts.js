var app = angular.module('bloom',['labs.controllers','ngRoute','auth0.lock', 'angular-jwt']);

app.
  config(['$locationProvider', '$routeProvider','lockProvider',
    function config($locationProvider, $routeProvider,lockProvider) {

      $routeProvider.
        when('/chat', {
          templateUrl : 'asset/templates/chat.html',
          controller : 'chatCtrl',
          controllerAs: 'vm' 
        }).
        when('/files', {
          templateUrl : 'asset/templates/files.html',
          controller : 'filesCtrl',
          controllerAs: 'vm'
        }).
        when('/login', {
          templateUrl : 'asset/templates/login.html',
          controller : 'login_ctrl',
          controllerAs: 'vm'
        }).
        otherwise('/chat');

        lockProvider.init({
          clientID: AUTH0_CLIENT_ID,
          domain: AUTH0_DOMAIN
        });
    }
  ]);

var controller_module = angular.module('labs.controllers', []);

(function () {
  
  'use strict';

  angular
    .module('bloom')
    .run(run);

  run.$inject = ['$rootScope', 'authService', 'lock'];

  function run($rootScope, authService, lock) {
    // Put the authService on $rootScope so its methods
    // can be accessed from the nav bar
    $rootScope.authService = authService;

    // Register the authentication listener that is
    // set up in auth.service.js
    authService.registerAuthenticationListener();

    // Register the synchronous hash parser
    lock.interceptHash();
  }
  
})();

var AUTH0_CLIENT_ID='rtbHpAVrGNPYLcosmTvBlPrWBjhmRw8Y'; 
var AUTH0_DOMAIN='stealth007.auth0.com'; 
var AUTH0_CALLBACK_URL='http://localhost:8080/#/home';

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

$(function() {
	$(window).resize(function(){
		var window_height = jQuery(window).height();
	  jQuery(".main").height(window_height - 120);
	});
});

(function () {

  'use strict';

  angular
    .module('bloom')
    .service('authService', authService);

  authService.$inject = ['lock', 'authManager'];

  function authService(lock, authManager) {

    function login() {
      lock.show();
    }

    // Logging out just requires removing the user's
    // id_token and profile
    function logout() {
      localStorage.removeItem('id_token');
      authManager.unauthenticate();
    }

    // Set up the logic for when a user authenticates
    // This method is called from app.run.js
    function registerAuthenticationListener() {
      lock.on('authenticated', function (authResult) {
        localStorage.setItem('id_token', authResult.idToken);
        authManager.authenticate();
      });
    }

    return {
      login: login,
      logout: logout,
      registerAuthenticationListener: registerAuthenticationListener
    }
  }
})();


controller_module.controller('chatCtrl',["$scope", 'authService',function($scope,authService) {
  //Set the menu item to active
  jQuery(".item").removeClass('active');
  jQuery('[link=chat]').addClass('active');
  chat_stub.init();
  file_stub.init();

  var window_height = jQuery(window).height();
  jQuery(".main").height(window_height - 120);

  var vm = this;
  vm.authService = authService;

  if(!$scope.isAuthenticated) {
  		vm.authService.login();
  }
  //console.log($scope.isAuthenticated);
}]);


controller_module.controller('filesCtrl',["$scope", function($scope) {
    //Set the menu item to active
    jQuery(".item").removeClass('active');
    jQuery('[link=files]').addClass('active');
    file_stub.init();
    var window_height = jQuery(window).height();
    jQuery(".main").height(window_height-60);
}]);


controller_module.controller('login_ctrl',["$scope", 'authService',function($scope,authService) {
	var vm = this;
  	vm.authService = authService;
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
		            self.addMessage(packet);
		        },
		        presence: function(presenceEvent) {
		            // handle presence
								// console.log(presenceEvent);
								if(presenceEvent.action === 'state-change') {
				            if(presenceEvent.state &&  presenceEvent.state.isTyping == true && presenceEvent.uuid != self.uuid ) {
												//$("[rel=status]").html(presenceEvent.uuid + ' is typing...');
				            } else {
												//$("[rel=status]").html("");
										}
				        }
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
		//d.setDate(d.getDate()-10);
		var packet = {
			content : data,
			sender : storage.get("uuid")
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
	publish_status : function(name,value){
		var self = this;
		var state = {};
		state[name] = value;
		var channels = [];

		channels.push(self.channel);

		pubnub.setState(
			{
					state: state,
					channels: channels
			},
			function (status, response) {
					// handle status, response
			}
			);
	},
	connect : function(uuid) {
		self.uuid = uuid;
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

		var $input = $('#content');

		//on keyup, start the countdown
		$input.on('keyup', function () {
			self.publish_status('isTyping',true);
		});

		$input.keyup(_.debounce(function() {
			console.log('stopped typing');
			self.publish_status('isTyping',false);
		},3000));

	},
	init : function() {
		var self = this;
		//storage.set("uuid","harika");
		var value = storage.get("uuid");
		self.bindEvents();
		self.precompileTemplates();
		//if(!value) {
		    //$("#usermodel").modal('show');
		//} else {
		    self.connect(value);
		//}
	},
	addMessage : function(packet) {
		var self = this;
		var date = new Date(packet.timetoken/1e4);
		var key = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
		var markup = self.getEntryMarkup(packet);

		if(!self.sorted_messages.hasOwnProperty(key)) {
			$("[rel=chat]").append('<div class="date_seperator">' + moment(date).format('Do MMM') + '</div>');
		}

		$("[rel=chat]").append(markup);
		$("img.lazy").lazyload();
		self.focusLastMessage();
		self.populateLastMessageTime(packet.timetoken);
	},
	addListOfMessages : function(messages) {
		var list = '';
		var self = this;
		var last_message_time = 0;
		self.sorted_messages = {};
		$.each(messages,function(idx,el) {
			if(jQuery.isPlainObject(el.entry)) {
				last_message_time = el.timetoken;
				var date = new Date(el.timetoken/1e4);
				var key = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
				if(!self.sorted_messages.hasOwnProperty(key)) {
					self.sorted_messages[key] = [];
				}
				//list += self.getEntryMarkup(el.entry);
				self.sorted_messages[key].push(self.getEntryMarkup(el))
			}
		});
		$.each(_.keys(self.sorted_messages),function(idx,el) {
				list += '<div class="date_seperator">' + moment(el).format('Do MMM') + '</div>';
				$.each(self.sorted_messages[el],function(i,markup) {
						list += markup;
				});
		});

		$("[rel=chat]").append(list);
		$("img.lazy").lazyload({
			container: $("[rel=chat]"),
			effect : 'fadeIn',
			load :function() {
			}
		});
		self.populateLastMessageTime(last_message_time);
		self.focusLastMessage();
	},
	getEntryMarkup : function(packet) {
		var self = this;
		var message = packet.entry || packet.message;
		var current_user = storage.get("uuid");
		var time = moment(new Date(packet.timetoken/1e4)).format('h:mm a');
		var tmpl = '';
		if(message.is_file == undefined || !message.is_file) {
			if(current_user == message.sender){
					tmpl = self.my_text_template({ content : message.content ,time:time,time_stamp:message.time });
			} else {
				  tmpl = self.other_text_template({ content : message.content ,time:time,time_stamp:message.time });
			}
		} else {
			if(current_user == message.sender) {
					tmpl = self.my_file_template({ content : message.content ,time:time,time_stamp:message.time });
			} else {
					tmpl = self.other_file_template({ content : message.content ,time:time,time_stamp:message.time });
			}

		}
		return tmpl;
	},
	precompileTemplates : function(){
		var self = this;
		var source   = $("#chat_other_message").html();
		self.other_text_template = Handlebars.compile(source);

		source   = $("#chat_my_message").html();
		self.my_text_template = Handlebars.compile(source);

		source   = $("#chat_other_message_file").html();
		self.other_file_template = Handlebars.compile(source);

		source   = $("#chat_my_message_file").html();
		self.my_file_template = Handlebars.compile(source);

	},
	getHistory : function() {
		var self = this;
		pubnub.history({
	        channel: self.channel,
	        reverse: false, // true to send via post
	        count: 10 ,// how many items to fetch,
					'stringifiedTimeToken' : true,
	    },
	    function (status, response) {
	        // handle status, response
	        if(status.statusCode == 200) {
	        	self.addListOfMessages(response.messages);
	        }
	    });
	},
	focusLastMessage : function(){
		var trueDivHeight = $('.main')[0].scrollHeight;
		var divHeight = $('.main').height();
		$('.main').animate({
            scrollTop: trueDivHeight - divHeight + 200
        }, 1000);

	},
	populateLastMessageTime : function(time){
			var self = this;
			if(time != 0) {
				jQuery("[rel=status]").html(self.getHumanDate(time));
			} else {
				jQuery("[rel=status]").html("0 Messages");
			}

	},
	getHumanDate : function(time) {
		var date = new Date(time/1e4);
		return moment(date).calendar();
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
