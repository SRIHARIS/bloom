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
		    if(e.which == 13) {
						var content = $('#content').val();
						if(content != undefined && content.length > 0) {
								self.publish(content,false);
						}

		    }
		});

		var $input = $('#content');

		//on keyup, start the countdown
		$input.on('keyup', function () {
			self.publish_status('isTyping',true);
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
