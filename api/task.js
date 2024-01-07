const moment = require('moment')
const { where } = require('../config/db')

module.exports = app => {
    const getTasks = (req, res) => {
        const date = req.query.date ? req.query.date
            : moment().endOf('day').toDate()

        app.db('tasks')
            .where({ userId: req.user.id })
            .where('estimate', '<=', date)
            .orderBy('estimate')
            .then(tasks => res.json(tasks))
            .catch(err => res.status(400).json(err))
    }

    const save = (req, res) => {
        if(!req.body.desc.trim()) {
            return res.status(400).send('Descrição é um campo necessário.')
        }

        req.body.userId = req.user.id

        app.db('tasks')
            .insert(req.body)
            .then(_ => res.status(204).send())
            .catch(err => res.status(400).json(err))
    }

    const remove = (req, res) => {
        app.db('tasks')
            .where({ id: req.params.id, userId: req.user.id })
            .del()
            .then(rowsDeleted =>{
                if( rowsDeleted > 0) {
                    res.status(204).send()
                } else {
                    const msg = `Não foi encontrado task com id ${req.params.id}.`
                    res.status(400).send(msg)
                }
            })
            .catch(err => res.status(400).json(err))
    }

    const updateTaskDone = (req, res, done) => {
        app.db('tasks')
            .where({ id: req.params.id, userId: req.user.id })
            .update({ done })
            .then(_ => res.status(204).send())
            .catch(err => res.status(400).json(err))
    }

    const toggleTask = (req, res, done) => {
        app.db('tasks')
            .where({ id: req.params.id, userId: req.user.id })
            .first()
            .then(tasks => {
                if(!task){
                    const msg = `Tarefa com id ${req.params.id} não existe.`;
                    return res.status(400).send(msg)
                }

                const done = task.done ? null : new Date()
                updateTaskDone(req, res, done)
            })
            .catch(err => res.status(400).json(err))
    }

    return { getTasks, save, remove, toggleTask }
}