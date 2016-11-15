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
