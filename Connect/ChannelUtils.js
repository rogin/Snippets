/**
 * ChannelUtils
 * @param config: {name, user, password, url, dbClass, cacheConnection, cacheName}
 * @param config.name: a db connection name must be unique or will cause issues
 * @param config.user: user name to use for db connection
 * @param config.password: db user password
 * @param config.url: db url
 * @param config.dbClass: db class - Default: org.postgresql.Driver
 * @param config.cacheConnection: Should cache the connection? true/false
 * @param config.cacheName: default - cachedConnection:ChannelUtils:channelName:config.name
 * @constructor
 */
function ChannelUtils(config) {
    config = config || $cfg('mirthDB')
    DBConnection.call(this, config)
  }
  
  ChannelUtils.prototype = Object.create(DBConnection.prototype)
  
  // $tryElse inherited from DBConnection
  
  ChannelUtils.prototype.getDBID = function (cid, debug) {
    cid = cid || channelId
    const statement = 'SELECT local_channel_id from d_channels where channel_id = ?;'
    if (debug) {
      logger.debug(['ChannelUtils.prototype.getDBID(cid=', cid, ', debug=', debug, ')\n  ', this.denormalizeSQL(statement, [cid])].join(''))
    }
    const resultSet = this.executeDBStatement(statement, true, [cid])
    if (resultSet.next()) {
      const result = parseInt(JSON.parse(resultSet.getString(1)))
      if (debug) {
        logger.debug(['ChannelUtils.prototype.getDBID(cid=', cid, ', debug=', debug, ') result = ', result].join(''))
      }
      return result
    }
    throw new Error([channelId, ':', channelId, ': ', 'Failed to get DB ID for channelId: ', cid].join(''))
  }
  
  ChannelUtils.prototype.createMetaDataIndex = function (metadata, debug) {
    const columnName = metadata.toUpperCase()
    const tableName = 'd_mcm' + this.getDBID()
    const sqlStmt = 'CREATE INDEX CONCURRENTLY IF NOT EXISTS ' + 'idx_' + tableName + '_' + columnName + ' ON ' + tableName + ' ("' + columnName + '");'
    if (debug) {
      logger.debug(['ChannelUtils.prototype.createMetaDataIndex(metadata=', metadata, ', debug=', debug, ') sqlStmt = ', sqlStmt].join(''))
    }
    this.executeDBStatement(sqlStmt, false)
  }
  
  ChannelUtils.prototype.getMessageByMetadata = function (key, value, cid, debug) {
    const dbID = this.getDBID(cid, debug)
    if (!dbID) {
      this.throwError('getMessageByMetadata()', 'No dbID found for channel ID: ' + cid)
    }
    const sql = [
      'select * from d_mc## right join d_mcm## on d_mcm##.message_id = d_mc##.message_id and d_mcm##.metadata_id = d_mc##.metadata_id where "',
      key.toUpperCase(),
      '" = ?::varchar and content_type = 1'
    ].join('').replace(/##/g, dbID)
    const sqlStmnt = this.sqlRowsAsJSON(sql)
    if (debug) {
      logger.debug([
        'ChannelUtils.prototype.getMessageByMetadata(key=', key, ', value=', value, ', cid=', cid, ', debug=', debug, ') sqlStmnt = ',
        this.denormalizeSQL(sqlStmnt, [String(value)])
      ].join(''))
    }
    // value is explicitly converted to a string for mirth 3.7.0 to fix:
    // org.postgresql.util.PSQLException: Can't infer the SQL type to use for an instance of org.mozilla.javascript.NativeString
    const resultSet = this.executeDBStatement(sqlStmnt || sql, true, [String(value)])
    if (resultSet.next()) {
      const result = sqlStmnt ? JSON.parse(resultSet.getString(1)) : resultSet
      if (debug) {
        logger.debug([
          'ChannelUtils.prototype.getMessageByMetadata(key=', key, ', value=', value, ', cid=', cid, ', debug=', debug, ') result = ',
          result
        ].join(''))
      }
      return result
    }
    return sqlStmnt ? [] : resultSet
  }
  
  ChannelUtils._updateIndex = function (name, cid) {
    const globalIndex = globalMap.get('ChannelUtilsIndex') || {}
    globalIndex[name] = cid
    globalMap.put('ChannelUtilsIndex', globalIndex)
  }
  
  ChannelUtils.setMessageIndex = function (key, value, name, dbConfig) {
    const channelUtils = new ChannelUtils(String($cfg(dbConfig)))
    channelUtils.createMetaDataIndex(key)
    channelMap.put(key, value)
    ChannelUtils._updateIndex(name, channelId)
  }
  
  ChannelUtils.getMessageByIndex = function (key, value, name, dbConfig, options) {
    options = options || {sort: true}
    const channelUtils = new ChannelUtils(String($cfg(dbConfig)))
    const globalIndex = globalMap.get('ChannelUtilsIndex')
    const cid = globalIndex[name]
    var result = channelUtils.getMessageByMetadata(key, value, cid) || []
    if (options.sort) {
      result = result.sort((a, b) => a.message_id > b.message_id)
    }
    if (options.parseXml) {
      result = result.map(order => new XML(SerializerFactory.getSerializer('HL7V2').toXML(order.content)))
      if (options.filter) {
        result = result.filter(order => options.filter.indexOf(order['ORC']['ORC.1']['ORC.1.1'].toString()) > -1)
      }
    }
    return result
  }
  
  /**
   * Gets messages from channel with {channelID} by metadata column {key} with value of {value}
   * @param {string} key metadata column
   * @param {string} value metadata value
   * @param {string} channelID
   * @param {string} dbConfig $cfg map key for db config
   * @param {boolean} [parseXml=false] should parse to XML?
   * @param {boolean} [sort=true] should sort by message id?
   * @param {[string]} [filter] should filter on ORC.1.1 example ['XO', 'NW', 'SC']
   * @param debug
   * @return {[*]}
   */
  ChannelUtils.getMessageByIndexV2 = function ({key, value, channelID, dbConfig, parseXml, sort, filter, debug}) {
    const channelUtils = new ChannelUtils(String($cfg(dbConfig)))
    var result = channelUtils.getMessageByMetadata(key, value, channelID, debug) || []
    if (debug) {
      logger.debug([
        'ChannelUtils.prototype.getMessageByIndexV2(key=', key, ', value=', value, ', channelID=', channelID, ', dbConfig=', dbConfig,
        ', parseXml=', parseXml, ', sort=', sort, 'filter=', filter, ', debug=', debug, ') result = ',
        JSON.stringify(result,null,2)
      ].join(''))
    }
    if (sort) {
      result = result.sort((a, b) => a.message_id > b.message_id)
    }
    if (parseXml) {
      result = result.map(order => new XML(SerializerFactory.getSerializer('HL7V2').toXML(order.content)))
      if (Array.isArray(filter)) {
        result = result.filter(order => filter.indexOf(order['ORC']['ORC.1']['ORC.1.1'].toString()) > -1)
      }
    }
    return result
  }
  
  /* global $cfg, SerializerFactory, XML, globalMap, channelMap, channelId, DBConnection, logger */
  