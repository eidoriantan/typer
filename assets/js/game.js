
let words = null
let game = null

function Game () {
  this.timer = null
  this.started = false
  this.score = -1
  this.highscore = $('#highscore').text().toInt()
}

Game.prototype.init = function () {
  $('#submit-form').submit(event => {
    event.preventDefault()

    if (this.started) {
      const word = $('#word').text()
      const input = $('#word-input').val()

      if (word === input.toLowerCase()) {
        $('#game .fail').text('')
        this.next()
      } else {
        $('#game .fail').text('Incorrect word')
      }
    }
  })

  $('#submit-form').on('input', () => {
    if (!this.started) this.start()
    $('#game .fail').text('')
  })
}

Game.prototype.next = function () {
  if (words === null) throw new Error('Words were not loaded!')

  $('#word').text('')
  $('#word-input').val('')
  $('#score').text(++this.score)

  const random = Math.floor(Math.random() * words.length)
  const word = words[random]

  $('#word').text(word)
}

Game.prototype.start = function () {
  $('#start').toggle()
  $('#word-input').attr('disabled', null)
  $('#submit-form').find('button[type=submit]').attr('disabled', null)

  this.score = -1
  this.started = true
  this.timer = setInterval(() => {
    let time = $('#timer').text().toInt()

    if (time > 0) $('#timer').text(--time)
    else this.stop()
  }, 1000)

  this.next()
}

Game.prototype.stop = function () {
  clearInterval(this.timer)

  $('#start').toggle()
  $('#timer').text('25')
  $('#word').text('Typer')
  $('#word-input').val('').attr('disabled', true)
  $('#submit-form').find('button[type=submit]').attr('disabled', true)

  if (this.score > this.highscore) {
    this.highscore = this.score
    $('#highscore').text(this.highscore)
  }

  this.timer = null
  this.started = false
}

$(document).ready(function () {
  $.ajax('http://unpkg.com/an-array-of-english-words/index.json', {
    xhr: function () {
      const xhr = new XMLHttpRequest()
      xhr.onprogress = function (event) {
        if (!event.lengthComputable) return

        const percent = Math.floor(event.loaded / event.total * 100)
        const percentText = percent.toString() + '%'
        $('#initial-loading').find('.progress-bar')
          .width(percentText)
          .attr('aria-valuenow', percent)
          .text(percentText)
      }

      return xhr
    },
    success: function (json) {
      words = json
      game = new Game()
      game.init()

      $('#initial-loading').hide()
      $('#game').show()
      $('#start').click(function () { game.start() })
    }
  })
})

String.prototype.toInt = function () {
  return parseInt(this)
}
