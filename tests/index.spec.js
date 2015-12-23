var Logger = require('../build');

function testLogMethod(method) {
  describe('#' + method, () => {
    var logger;
    beforeEach(() => {
      logger = new Logger();
    });

    it('should emit event', () => {
      var spy = jasmine.createSpy();

      Logger.addListener(spy);

      logger[method]('test');
      expect(spy).toHaveBeenCalledWith(method, 'test');
    });
  });
}

describe('Logger', () => {
  beforeEach(() => {
    process.env.LOG_LEVEL = 'trace';
  });

  testLogMethod('info');
  testLogMethod('debug');
  testLogMethod('trace');
  testLogMethod('warn');
  testLogMethod('error');

  it('should support namespace', () => {
    var logger = new Logger('unit');
    var spy = jasmine.createSpy();

    Logger.addListener(spy);

    logger.info('test');
    expect(spy).toHaveBeenCalledWith('info', '<unit> test');
  });

  it('should ignore when having different namespace', () => {
    process.env.LOG_NAMESPACE = 'test';

    var logger = new Logger('unit');
    var spy = jasmine.createSpy();

    Logger.addListener(spy);

    logger.info('test');
    expect(spy).not.toHaveBeenCalled();
  });

  it('should support wildcard matching', () => {
    process.env.LOG_NAMESPACE = 'sql:*';

    var logger = new Logger('sql:insert');
    var spy = jasmine.createSpy();

    Logger.addListener(spy);

    logger.info('test');
    expect(spy).toHaveBeenCalledWith('info', '<sql:insert> test');
  });

  afterEach(() => {
    delete process.env.LOG_NAMESPACE;
    Logger.clearListener();
  });
});
