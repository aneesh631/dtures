$(() => {
    $('.dropdown').on('show.bs.dropdown', function(e){
        $(this).find('.dropdown-menu').first().stop(true, true).slideDown(300);
    });
      
    $('.dropdown').on('hide.bs.dropdown', function(e){
        $(this).find('.dropdown-menu').first().stop(true, true).slideUp(200);
    });

    $('.btn-danger').click(function (e) {
        let email = $($(e.currentTarget).parent().prev().children()[0]).text().split(' ').pop()
        $.confirm({
            title: 'Delete user!',
            content: `Are you sure you want to delete user with email: ${email}?`,
            type: 'red',
            typeAnimated: true,
            backgroundDismiss: true,
            buttons: {
                confirm: {
                    text: 'Confirm',
                    btnClass: 'btn-red',
                    action: function () {
                        $.alert({
                            content: function () {
                                var self = this;
                                return $.ajax({
                                    url: '/admin/users',
                                    type: 'DELETE',
                                    data: {email}
                                }).done(user => {
                                    self.setTitle('Success')
                                    self.setType('green')
                                    self.setContent(`Successfully removed ${user.email}`)
                                })
                                .fail((e) => {
                                    self.setTitle('Error')
                                    self.setType('red')
                                    self.setContent(e.responseJSON.error)
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
    $('form').submit(function (e) {
        e.preventDefault()
        let formData = $(this).serialize()
        $.alert({
            title: 'Add user',
            content: function () {
                var self = this;
                return $.ajax({
                    type: "POST",
                    url: '/admin/users',
                    data: formData
                }).done(user => self.setContent(`Added ${user.name} : ${user.email}`)
                ).fail(() => self.setContent('Something went wrong.'))
            },
            onClose: function () {window.location.reload()}
        })
    })
})