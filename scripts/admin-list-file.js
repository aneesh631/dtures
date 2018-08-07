$(() => {
    $('.dropdown').on('show.bs.dropdown', function(e){
        $(this).find('.dropdown-menu').first().stop(true, true).slideDown(300);
    });
      
    $('.dropdown').on('hide.bs.dropdown', function(e){
        $(this).find('.dropdown-menu').first().stop(true, true).slideUp(200);
    });

    $('.remove').click((event) => {
        let parents = $(event.currentTarget).parents()
        let childID = parents[2].getAttribute('data-id')
        let parentID = parents[3].getAttribute('data-id')
        let filename = parents[1].children[0].innerText
        $.confirm({
            title: 'Delete file!',
            content: `Are you sure you want to delete ${filename}`,
            type: 'red',
            typeAnimated: true,
            backgroundDismiss: true,
            buttons: {
                confirm: {
                    text: 'Confirm',
                    btnClass: 'btn-red',
                    action: function () {
                        $.alert({
                            title: 'Deleting file',
                            content: function () {
                                var self = this;
                                return $.ajax({
                                    url: '/admin/files',
                                    type: 'DELETE',
                                    data: {childID,parentID}
                                })
                                .done(filename => {
                                    self.setType('green')
                                    self.setTitle('Success')
                                    self.setContent(`Deleted ${filename}!`)
                                })
                                .fail(() => {
                                    self.setType('red')
                                    self.setTitle('Error')
                                    self.setContent('Something went wrong.')
                                })
                            },
                            onClose: function () {window.location.reload()}
                        })
                    }
                },
                cancel: function () {}
            }
        })
        
    })

    $('.edit').click(function (event) {
        let parents = $(event.currentTarget).parents()
        let currentFilename = parents[1].children[0].innerText
        currentFilename = currentFilename.split('.')
        let ext = currentFilename.pop()
        currentFilename = currentFilename.join('.')
        let fileID = parents[2].getAttribute('data-id')
        $.confirm({
            title: 'Edit filename',
            content: '' +
            '<form>' +
            '<div class="form-group">' +
            '<label>Enter something here</label>' +
            `<input type="text" value="${currentFilename}" class="name form-control" required />` +
            '</div>' +
            '</form>',
            backgroundDismiss: true,
            buttons: {
                formSubmit: {
                    text: 'Submit',
                    btnClass: 'btn-blue',
                    action: function () {
                        var name = this.$content.find('.name').val();
                        if(!name){
                            $.alert('provide a valid name');
                            return false;
                        }
                        $.alert({
                            content: function () {
                                var self = this;
                                return $.ajax({
                                    url: '/admin/files',
                                    type: 'PATCH',
                                    data: {id: fileID,filename: name}
                                }).done(filename => {
                                    self.setTitle('Success')
                                    self.setContent(`Changed ${currentFilename}.${ext} to ${filename}!`)
                                    self.setType('green')
                                })
                                .fail(() => {
                                    self.setTitle('Error')
                                    self.setContent('Something went wrong.')
                                    self.setType('red')
                                })
                            },
                            onClose: function () {window.location.reload()}
                        })
                    }
                },
                cancel: function () {},
            },
            onContentReady: function () {
                var jc = this;
                this.$content.find('form').on('submit', function (e) {
                    e.preventDefault();
                    jc.$$formSubmit.trigger('click')
                });
            }
        });
    })
})