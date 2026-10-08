/** Implementação da porta Clock com o relógio do sistema. */
class SystemClock {
  now() {
    return new Date();
  }
}

module.exports = { SystemClock };
