var app = angular.module('bloom',['labs.controllers','ngRoute','auth0.lock', 'angular-jwt']);

app.
  config(['$httpProvider','$locationProvider', '$routeProvider','lockProvider','jwtOptionsProvider',
    function config($httpProvider,$locationProvider, $routeProvider,lockProvider,jwtOptionsProvider) {
      var options = {
        allowSignUp: false,
        closable: false,
        theme: {
          logo: 'http://stealth007.herokuapp.com/asset/images/logo.png',
          primaryColor: '#673E8C'
        },
        allowForgotPassword: false

      };
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
          domain: AUTH0_DOMAIN,
          options : options
        });
        
        jwtOptionsProvider.config({
          tokenGetter: function () {
            return localStorage.getItem('id_token');
          }
        });

        $httpProvider.interceptors.push('jwtInterceptor');
    }
  ]);

var controller_module = angular.module('labs.controllers', []);

(function () {

  'use strict';

  angular
    .module('bloom')
    .run(run);

  run.$inject = ['$rootScope', 'authService', 'lock','authManager'];

  function run($rootScope, authService, lock,authManager) {
    // Put the authService on $rootScope so its methods
    // can be accessed from the nav bar
    $rootScope.authService = authService;

    // Register the authentication listener that is
    // set up in auth.service.js
    authService.registerAuthenticationListener();

    // Register the synchronous hash parser
    lock.interceptHash();

    authManager.checkAuthOnRefresh();
  }

})();

var AUTH0_CLIENT_ID='rtbHpAVrGNPYLcosmTvBlPrWBjhmRw8Y';
var AUTH0_DOMAIN='stealth007.auth0.com';
var AUTH0_CALLBACK_URL='http://192.168.1.2:5000/#/chat';

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
			jQuery('.loader').removeClass('hide');
		},
		hide : function() {
			jQuery('.loader').addClass('hide');
		}
}

$(function() {
	$(window).resize(function(){
		var window_height = jQuery(window).height();
	  jQuery(".main").height(window_height - 120);
	});

	var hidden, visibilityChange;
	if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support
	  hidden = "hidden";
	  visibilityChange = "visibilitychange";
	} else if (typeof document.msHidden !== "undefined") {
	  hidden = "msHidden";
	  visibilityChange = "msvisibilitychange";
	} else if (typeof document.webkitHidden !== "undefined") {
	  hidden = "webkitHidden";
	  visibilityChange = "webkitvisibilitychange";
	}

	// Warn if the browser doesn't support addEventListener or the Page Visibility API
	if (typeof document.addEventListener === "undefined" || typeof document[hidden] === "undefined") {
	  console.log("This demo requires a browser, such as Google Chrome or Firefox, that supports the Page Visibility API.");
	} else {
	  // Handle page visibility change
	  document.addEventListener(visibilityChange, handleVisibilityChange, false);
	}
});

pageInFocus = true;

function handleVisibilityChange() {
  if (document.hidden) {
  	pageInFocus = false;
  	//console.log('hidden');
  } else  {
  	pageInFocus = true;
    //console.log('shown');
  }
  jQuery(document).trigger('pageFocusChanged');
}

(function () {

  'use strict';

  angular
    .module('bloom')
    .service('authService', authService);

  authService.$inject = ['$q','lock', 'authManager'];

  function authService($q,lock, authManager) {

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
    var deferredProfile = $q.defer();
    var userProfile = JSON.parse(localStorage.getItem('profile')) || null;

    if (userProfile) {
      deferredProfile.resolve(userProfile);
    }

    function registerAuthenticationListener() {
      lock.on('authenticated', function (authResult) {

        lock.getProfile(authResult.idToken, function(error, profile) {
            if (error) {
              // Handle error
              return;
            }

            localStorage.setItem("profile", JSON.stringify(profile));
            deferredProfile.resolve(profile);
          });
        localStorage.setItem('id_token', authResult.idToken);
        authManager.authenticate();
      });
    }

    function getProfileDeferred() {
      return deferredProfile.promise;
    }
    
    return {
      login: login,
      logout: logout,
      registerAuthenticationListener: registerAuthenticationListener,
      getProfileDeferred: getProfileDeferred
    }
  }
})();


controller_module.controller('chatCtrl',["$scope", 'authService',function($scope,authService) {
  //Set the menu item to active
  jQuery(".item").removeClass('active');
  jQuery('[link=chat]').addClass('active');

  var window_height = jQuery(window).height();
  jQuery(".main").height(window_height - 120);

  var vm = this;
  vm.authService = authService;

  if(!$scope.isAuthenticated) {
  		vm.authService.login();
  }

  authService.getProfileDeferred().then(function (profile) {
        vm.profile = profile;
        chat_stub.init(profile);
        file_stub.init(profile);
  });
  //console.log($scope.isAuthenticated);
}]);


controller_module.controller('filesCtrl',["$scope",'authService', function($scope,authService) {
    //Set the menu item to active
    jQuery(".item").removeClass('active');
    jQuery('[link=files]').addClass('active');
    var window_height = jQuery(window).height();
    jQuery(".main").height(window_height-60);

    var vm = this;
  	vm.authService = authService;

  	if(!$scope.isAuthenticated) {
  		vm.authService.login();
  	}

    authService.getProfileDeferred().then(function (profile) {
          vm.profile = profile;
          file_stub.init(profile);
    });
}]);


controller_module.controller('login_ctrl',["$scope", 'authService',function($scope,authService) {
	var vm = this;
  	vm.authService = authService;
}]);


var chat_stub  = {
	channel : 'politecheese_0',
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
		            self.addMessage(packet);
		        },
		        presence: function(presenceEvent) {
		            	// handle presence
						console.log(presenceEvent);
						if(presenceEvent.action === 'state-change') {
				            if(presenceEvent.state &&  presenceEvent.state.isTyping == true && presenceEvent.uuid != self.profile.nickname ) {
								$("[rel=status]").html(presenceEvent.uuid + ' is typing...');
				            } else {
								$("[rel=status]").html(self.populateLastMessageTime(self.last_message_time));
							}
				        }
		        }
		    })
		    //console.log("Subscribing..");
		    pubnub.subscribe({
		        channels: [self.channel],
						withPresence: true
		    });
	},
	publish : function(data,is_file) {
		//console.log("Since we're publishing on subscribe connectEvent, we're sure we'll receive the following publish.");
		var self = this;
		var message = $('#content').val();
		//d.setDate(d.getDate()-10);
		var packet = {
			content : data,
			sender : self.profile.nickname
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
	        	$('#content').val('');
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
		        uuid : uuid,
		        heartbeatInterval : 10
		});
		this.subscribe();
		this.getHistory();
	},
	bindEvents : function() {
		//console.log('ok')
		var self = this;
		$(document).off(".chat_event");

		$(document).on('keypress.chat_event',function(e) {
		    if(e.which == 13 && !e.shiftKey) {
						self.formSubmit();
		    }
		});

		$(document).on('click.chat_event',"[rel=send]",function(){
				self.formSubmit();
		});

		$(document).on('click.chat_event',"[rel=clear]",function(){
				$('#content').val("");
		});

		var $input = $('#content');

		//on keyup, start the countdown
		$input.on('keyup', function () {
			self.publish_status('isTyping',true);
			var content = $('#content').val();
			if(content != undefined && content.length > 0) {
					jQuery("[rel=clear]").removeClass('hide');
			}else{
					jQuery("[rel=clear]").addClass('hide');
			}
		});

		$input.on("keyup.chat_event",_.debounce(function() {
			//console.log('stopped typing');
			self.publish_status('isTyping',false);
		},3000));

		$(document).on('pageFocusChanged',function() {
			if(!pageInFocus) {
				storage.store('last_focus_time',(new Date()).getTime());
			} else {
				_.delay(function(){
					self.unreadCounter();
				},1000);

			}
		});

	},
	formSubmit : function(){
			var self = this;
			var content = $('#content').val();
			if(content != undefined && content.length > 0) {
					self.publish(content,false);
			}
	},
	unreadCounter : function() {
		var last_focus_time = storage.get('last_focus_time');
		var cnt = 0;
		var self = this;
		$.each($(".text_message.other"),function(i,el){
			var time = parseInt($(el).attr('data-time'));
			if(time > last_focus_time) {
				cnt++;
				$(el).addClass('unread_background');
			}
		});
		self.toggleCountBubble(cnt);
	},
	toggleCountBubble : function(cnt) {
		$count_bubble = $("[rel=unread_count]");
		if(cnt > 0) {
			$count_bubble.html(cnt).removeClass('hide');
			_.delay(function(){
				$count_bubble.addClass('hide');
				$(".unread_background").removeClass('unread_background');
			},6000);
		}else{
			$count_bubble.addClass('hide');
		}
	},
	init : function(profile_param) {
		var self = this;
		self.profile = profile_param;
		self.unread_count = 0;
		self.last_message_time = 0;
		self.bindEvents();
		self.precompileTemplates();
		self.connect(profile_param.nickname);
	},
	addMessage : function(packet) {
		var self = this;
		var date = new Date(packet.timetoken/1e4);
		var key = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
		var markup = self.getEntryMarkup(packet);

		if(!self.sorted_messages.hasOwnProperty(key)) {
			$("[rel=chat]").append('<div class="date_seperator">' + moment(date).format('Do MMM') + '</div>');
			self.sorted_messages[key] = [];
		}

		$("[rel=chat]").append(markup);
		$("img.lazy").lazyload();
		self.focusLastMessage();
		self.populateLastMessageTime(packet.timetoken);

		/* None of this will work in mobile*/
		if(packet.message.sender != self.profile.nickname) {
			if(!pageInFocus) {
				self.unread_count += 1;
				storage.store("unread_cnt",self.unread_count);
			}
		}

	},
	addListOfMessages : function(messages) {
		var list = '';
		var self = this;
		self.sorted_messages = {};
		$.each(messages,function(idx,el) {
			if($.isPlainObject(el.entry) && el.entry.content != "") {
				self.last_message_time = el.timetoken;
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
		self.populateLastMessageTime(self.last_message_time);
		self.focusLastMessage();
	},
	getEntryMarkup : function(packet) {
		var self = this;
		var message = packet.entry || packet.message;
		var current_user = self.profile.nickname;
		var unix_time = (packet.timetoken/1e4);
		var time = moment(new Date(packet.timetoken/1e4)).format('h:mm a');
		var tmpl = '';
		if(message.is_file == undefined || !message.is_file) {
			if(current_user == message.sender){
					tmpl = self.my_text_template({ content : message.content ,time:time,time_stamp:unix_time });
			} else {
				  tmpl = self.other_text_template({ content : message.content ,time:time,time_stamp:unix_time });
			}
		} else {
			if(current_user == message.sender) {
					tmpl = self.my_file_template({ content : message.content ,time:time,time_stamp:unix_time });
			} else {
					tmpl = self.other_file_template({ content : message.content ,time:time,time_stamp:unix_time });
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
			'stringifiedTimeToken' : true
	    },
	    function (status, response) {
	        // handle status, response
	        if(status.statusCode == 200) {
	        	self.addListOfMessages(response.messages);
	        }
	    });
	},
	focusLastMessage : function() {
		var trueDivHeight = $('.main')[0].scrollHeight;
		var divHeight = $('.main').height();
		$('.main').animate({
            scrollTop: trueDivHeight - divHeight + 200
        }, 1000);

	},
	populateLastMessageTime : function(time){
		var self = this;
		if(time != 0) {
			$("[rel=status]").html(self.getHumanDate(time));
		} else {
			$("[rel=status]").html("0 Messages");
		}

	},
	getHumanDate : function(time) {
		var date = new Date(time/1e4);
		return moment(date).calendar();
	}
};

//$(document).ready(function(){
	//chat_stub.init();
//});

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
