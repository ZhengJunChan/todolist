$(function () {

    var TodoModel = Backbone.Model.extend({
        defaults: function() {
            return {
                title: '',
                isDone: false
            };
        }
    });

    var TodoCollection = Backbone.Collection.extend({
        model: TodoModel,

        done: function() {
            return this.where({isDone: true});
        },

        remaining: function() {
            return this.where({isDone: false});
        }
    });

    var TodoView = Backbone.View.extend({
        tagName: 'li',

        template: _.template($('#item-template').html()),

        events: {
            'click .destroy': 'deleteTodoLabel',
            'change .toggle': 'toggle',
            "dblclick .view": "edit",
            'keypress .edit': 'updateOnEnter',
            "blur .edit": "update"
        },

        initialize: function() {
            this.listenTo(this.model, 'change', this.render);
            this.listenTo(this.model, 'destroy', this.removeDom);
        },

        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            this.$el.toggleClass('done', this.model.get('isDone'));

            this.input = this.$('.edit');
            
            return this;
        },

        deleteTodoLabel: function() {
            this.model.destroy();
        },

        toggle: function () {
            this.model.set({
                isDone: !this.model.get('isDone')
            });
        },

        edit: function() {
            this.$el.addClass("editing");
            this.input.focus();
        },

        updateOnEnter: function() {
            event.keyCode == 13 && this.update();
        },

        update: function() {
            var value = this.input.val();

            if (!value) {
                this.deleteTodoLabel();
            } else {
                this.model.set({title: value});
                this.$el.removeClass("editing");
            }
        },

        removeDom: function() {
            this.remove();
        }
    });

    var TodoList = new TodoCollection();

    var FooterModel = Backbone.Model.extend({
        defaults: function() {
            return {
                done: 0,
                remaining: 0,
                isShow: false
            }
        }
    });

    var footerData = new FooterModel();

    var FooterView = Backbone.View.extend({
        template: _.template($('#stats-template').html()),

        initialize: function() {
            this.listenTo(this.model, 'isShow', this.render);
        },

        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            
            return this;
        }
    });

    var AppView = Backbone.View.extend({
        el: $('#todoapp'),

        events: {
            'keypress #new-todo': 'addTodoLabel',
            "click #toggle-all": "toggleAllComplete",
            "click #clear-completed": "clearCompleted"
        },

        initialize: function() {
            this.main = $('#main');
            this.footer = this.$('footer');
            this.allCheckbox = $('#toggle-all');

            this.listenTo(TodoList, 'add', this.addOne);
            this.listenTo(TodoList, 'all', this.render);
            this.listenTo(footerData, 'change', this.renderFooter);
        },

        render: function() {
            if (TodoList.length) {
                this.main.show();
            } else {
                this.main.hide();
            }

            this.updataFooter();

            this.allCheckbox.attr('checked', !TodoList.remaining().length);
        },

        updataFooter: function() {
            var done = TodoList.done().length;
            var remaining = TodoList.remaining().length;

            footerData.set({
                isShow: TodoList.length,
                done: done,
                remaining: remaining
            });
        },

        renderFooter: function(model) {
            if (!model.get('isShow')) {
                this.footer.hide();
                return;
            }
            
            var footer = new FooterView({model: model});
            
            this.footer.html(footer.render().el);
            this.footer.show();
        },

        addTodoLabel: function(event) {
            var $input  = $(event.target);
            
            if (!$input.val() || event.keyCode != 13) {
                return;
            }

            TodoList.add({title: $input.val()});

            $input.val('');
        },

        addOne: function(model) {
            var view = new TodoView({model: model});
            this.$("#todo-list").append(view.render().el);
        },

        toggleAllComplete: function() {
            var isDone = $('#toggle-all').attr('checked');
            
            TodoList.each(function(todoLabel) {
                todoLabel.set({
                    isDone: !!isDone
                });
            });
        },

        clearCompleted: function() {
            _.each(TodoList.done(), function(todoLabel) {
                todoLabel.destroy();
            });
        }
    });

    var App = new AppView();
});
