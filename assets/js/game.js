/**
 *  Typer - Simple typing game for browser
 *  Copyright (C) 2020 - 2022, Adriane Justine Tan
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

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
  })

  $('#word-input').on('input', event => {
    if (this.started) {
      const word = $('#word').text()
      const input = $('#word-input').val()

      if (word === input.toLowerCase()) this.next()
      $('#word-input').focus()
    }
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
  $('#word-input').attr('disabled', null).focus()
  $('#submit-form').find('[type="reset"]').removeClass('d-none')

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
  $('#submit-form').find('[type="reset"]').addClass('d-none')

  if (this.score > this.highscore) {
    this.highscore = this.score
    localStorage.setItem('highscore', this.highscore)
    $('#highscore').text(this.highscore)
  }

  this.timer = null
  this.started = false
}

$(document).ready(function () {
  const highscore = localStorage.getItem('highscore')
  if (highscore !== null) $('#highscore').text(highscore)

  let filesize = 0
  $.ajax('https://unpkg.com/an-array-of-english-words@2.0.0/index.json?meta', {
    type: 'GET',
    dataType: 'json',
    success: function (json) { filesize = json.size }
  })

  $.ajax('https://unpkg.com/an-array-of-english-words@2.0.0/index.json', {
    type: 'GET',
    dataType: 'json',
    xhr: function () {
      const xhr = new XMLHttpRequest()
      xhr.onprogress = function (event) {
        const percent = Math.floor(event.loaded / filesize * 100)
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
      $('#submit-form').find('[type="reset"]').click(function () { game.stop() })
    }
  })
})

String.prototype.toInt = function () {
  return parseInt(this)
}
