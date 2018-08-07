$(() => {
    $('.dropdown').on('show.bs.dropdown', function(e){
        $(this).find('.dropdown-menu').first().stop(true, true).slideDown(300);
    });
      
    $('.dropdown').on('hide.bs.dropdown', function(e){
        $(this).find('.dropdown-menu').first().stop(true, true).slideUp(200);
    });

    $('form').submit(function(e) {
        e.preventDefault()
        let formData = $(this).serialize()
        $.confirm({
            title: 'Change password!',
            content: `Are you sure you want to change your password?`,
            type: 'orange',
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
                                    type: 'PATCH',
                                    data: formData
                                }).done(() => {
                                    self.setTitle('Success')
                                    self.setType('green')
                                    self.setContent('Successfully changed password!')
                                    setTimeout(() => window.location.href = '/admin/logout',4000)
                                })
                                .fail((e) => {
                                    self.setTitle('Error')
                                    self.setType('red')
                                    self.setContent(e.responseJSON.error)
                                })
                            }
                        })
                    }
                },
                cancel: function () {}
            }
        })
    })
})