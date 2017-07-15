
    class Slot {
        constructor(reelManagerModel, roleTypes) {
            this._reelManagerModel = reelManagerModel;
            this._isStart = false;
            this.intval = -1;
            this._reelUpdateTime = 60;
            this._isLeverOn = false;
            this._roleTypes = roleTypes;

        }

        start() {
            if (this._isStart)return;
            let scope = this;
            this._isStart = true;
            this._reelManagerModel.start();
            this.intval = setInterval(
                function () {
                    scope.update();
                }, this._reelUpdateTime
            )
        }

        update() {
            // 全部止まっていて、レバーオンしてなければ何もしない
            if (this._reelManagerModel.isAllStop() && !this._isLeverOn) {
                return;
            }
            this._reelManagerModel.next();

        }

        leverOn() {
            // 回転中なら何もしない
            if (!this._reelManagerModel.isAllStop()) {
                return
            }
            this._reelManagerModel.role = this.lotteryRole();
            this._isLeverOn = true;

        }

        lotteryRole() {
            // 役抽選
            let ROLE_WEIGHT = [380, 500, 600, 855, 975, 990, 1000];
            let type = 0;
            let roleRnd = Math.floor(Math.random() * ROLE_WEIGHT[ROLE_WEIGHT.length - 1]);
            for (let i = 0, len = ROLE_WEIGHT.length; i < len; i++) {
                if (roleRnd > ROLE_WEIGHT[i]) {
                    type = i - 1;
                    break;
                }
            }
            for (let typeName in this.roleTypes) {
                if (type === this.roleTypes[typeName].type)return this.roleTypes[typeName];
            }
        }

        stop(type) {
            this._isStart = false;


        }

    }

    class ReelManagerModel {

        /**
         *
         * @param {[Array.<number>]}reels リールの役配置
         * @param  {{LEFT:number ,RIGHT:number . CENTER: number}} reelNames リール名
         */
        constructor(reels, reelNames) {
            /**
             * リール名の定義
             * @type {{LEFT: number, RIGHT: number, CENTER: number}}
             * @private
             */
            this._reelNames = reelNames;

            /**
             * 各リールの役を配置する
             * @type {Array}
             */
            this._reels = [
                reels[reelNames.LEFT],
                reels[reelNames.CENTER],
                reels[reelNames.RIGHT]
            ];

            /**
             * 各リールの停止ステータスを管理する
             * @type {{}}
             * @private
             */
            this._isStopReels = {};
            /**
             * 各リールの停止位置を管理する
             * @type {{}}
             * @private
             */
            this._stopIndies = {};
            /**
             * 進めたことを通知するためのFUNC
             * @param indies
             * @private
             */
            this._obsNext = function (indies) {
            }
            /**
             * 停止したことを通知するためのFUNC
             * @private
             */
            this._obsStop = function () {
            }

            /**
             * スタートしたことを通知するためのFUNC
             * @private
             */
            this._obsStart = function () {
            }

            this._role;

            this.init();

        }

        set role(role) {
          console.log(role);
            this._role = role;
        }

        set obsNext(func) {
            this._obsNext = func;
        }

        set obsStop(func) {
            this._obsStop = func;
        }

        set obsStart(func) {
            this._obsStart = func;
        }

        /**
         *
         * @return {{STOP: number, MOVE: number}}
         * @constructor
         */
        static get STOP_TYPES() {
            return {
                  STOP: 0
                , MOVE: 1
            }
        }

        /**
         *
         */
        init() {
            this.updateAllReelStopParam(ReelManagerModel.STOP_TYPES.STOP);
            this.resetIndies(0);
        }

        /**
         *
         * @param index
         */
        resetIndies(index) {
            for (let reelName  in this._reelNames) {
                this.resetIndex(this._reelNames[reelName], index);
            }
        }

        /**
         *
         * @param reelName
         * @param index
         */
        resetIndex(reelName, index) {
            this._stopIndies[reelName] = index;
        }

        /**
         * すべてのリールSTOPタイプを変更する
         * @param {number} type 変更するタイプ
         */
        updateAllReelStopParam(type) {
            for (let reelName  in this._reelNames) {
                this.updateReelStopParam(this._reelNames[reelName], type);
            }

        }

        /**
         * リールSTOPタイプを変更する
         * @param reelType
         * @param type
         */
        updateReelStopParam(reelType, type) {
            this._isStopReels[reelType] = type;
        }


        /**
         *
         * @param  {{LEFT:number ,RIGHT:number . CENTER: number}}reelNames
         */
        set reelNames(reelNames) {
            this._reelNames = reelNames;
        }

        /**
         * リールを進める
         */
        next() {
            let resultIndies = [];
            for (let reelName  in this._reelNames) {
                let reelIndex = this._reelNames[reelName];
                // 止まってなかったら進める
                if (this._isStopReels[reelIndex]) {
                    this._stopIndies[reelIndex] = this.nextIndex(reelIndex);
                }
                // 当該のリールのインデックスを保持
                resultIndies[reelIndex] = this._stopIndies[reelIndex];
            }

            // アップデート通知
            this._obsNext(resultIndies);
        }


        /**
         * @param {number} reelIndex
         */
        nextIndex(reelIndex){
            let idx = this._stopIndies[reelIndex]+1;
            if(idx >= this._reels[reelIndex].length){
                idx= 0;
            }
            return idx;
        }
        /**
         * リール動作をスタートする
         */
        start() {
            this.updateAllReelStopParam(ReelManagerModel.STOP_TYPES.MOVE);
            this._obsStart();

        }


        /**
         *
         * @param reelType
         */
        stop(reelType) {

            this.updateReelStopParam(reelType, ReelManagerModel.STOP_TYPES.STOP);
            this.overrideIndex(reelType, this._role);
            // todo 全リールの役成立を行う必要あり,現在行っていないので役がそろわない.そろえる処理を書く
            // 全部止まってるなら整合性チェック
            if (this.isAllStop()) {

            }
            this._obsStop();

        }

        /**
         *
         * @param reelType
         * @param role
         */
        overrideIndex(reelType, role) {
            let checkCount = 0;
            // 定義されいなかったら、リールの長さを全部フォローする
            let maxCheckCount = role.maxCheckCount;

            if (maxCheckCount != 0 && !maxCheckCount) maxCheckCount = this._reels[reelType].length;

            // 現在のインデックスを取得
            let checkReelNowIndex = this._stopIndies[reelType];
            let isFindRole = false;
            // 現在indexから3つの範囲にroleに対応するものがあるかを探索
            // 存在すれば「各リールとの整合性チェック」存在しなければ、roleに応じた巻き込み処理
            while (checkCount < maxCheckCount && !isFindRole) {
                isFindRole = this.isInnerViewRole(reelType, checkReelNowIndex++, role);
                // 見つかったら整合性チェック

                // インデックスを進める
                checkCount++;
            }
            // 最終的に見つかったら見つかった位置で当該のリール停止位置を上書き
            if (isFindRole) {
                this._stopIndies[reelType] = checkReelNowIndex
            }

        }

        /**
         *
         * @param reelType
         * @param role
         * @param checkReelNowIndex
         * @return {boolean}
         */
        isInnerViewRole(reelType, checkReelNowIndex, role) {

            // 各リールは3マス表示されているとする
            let viewSize = 3;
            // 対応するリールのサイズを取得
            let reel = this._reels[reelType];
            let reelSize = reel.length;
            let checkCount = 0;
            let isEqual = false;
            // viewSize内にroleが存在するか
            while (checkCount < viewSize) {
                let checkIndex = checkReelNowIndex - checkCount;
                // reelの終端だったら、初期化
                if (checkIndex < 0) checkIndex = reelSize - 1 - checkCount;
                let targetRole = reel[checkIndex];
                isEqual = this.assertRole(targetRole, roleType)
                if (isEqual)break;
            }
            return isEqual;
        }

        /**
         *
         * @param targetRole
         * @param role
         * @return {boolean}
         */
        assertRole(targetRole, role) {
            return targetRole.type === role.type;
        }

        /**
         * 全リールが停止しているかの判定
         * @return {boolean}
         */
        isAllStop() {

            for (let reelName  in this._reelNames) {
                if (this._stopIndies[reelName] === ReelManagerModel.STOP_TYPES.MOVE)return false;
            }
            return true;
        }
    }
    (function () {
        //let dumpTag = document.querySelector("#indexDump");
        function imageUpdate(indies) {
            // dumpTag.textContent=
            //     "現在のリールINEDX[LEFT:"+indies[0]+"]"+"[CENTER:"+indies[1]+"]"+"[RIGHT:"+indies[2]+"]";
              $(function(){
              // アニメーションスピード(px/ミリ秒)
                  var scrollSpeed = 5;
                  // 画像サイズY軸(px)
                  var imgHeight = 1302;
                  // 画像の初期位置Y軸(px)
                  var leftPosY  = parseInt($('#reelLeft').css('background-position-y'));
                  var centPosY  = parseInt($('#reelCenter').css('background-position-y'));
                  var rightPosY = parseInt($('#reelRight').css('background-position-y'));
               //   console.log(indies);
                 setTimeout(function(){
                  // ループ処理
                 // console.log(centPosY);
                  //console.log(rightPosY);
                    let startLeft = setInterval(function() {
                      // 画像サイズまで移動したら0に戻る
                          if (leftPosY >= imgHeight) leftPosY = 0;
                          //scrollSpeed分移動
                          leftPosY += scrollSpeed;
                          $('#reelLeft').css("background-position","0 "+leftPosY+"px");
                      }, 1);
                    let startCenter = setInterval(function() {
                          if (centPosY >= imgHeight) centPosY = 0;
                          centPosY += scrollSpeed;
                          $('#reelCenter').css("background-position","0 "+centPosY+"px");
                      }, 1);
                    let startRight = setInterval(function() {
                          if (rightPosY >= imgHeight) rightPosY = 0;
                          rightPosY += scrollSpeed;
                          $('#reelRight').css("background-position","0 "+rightPosY+"px");
                      }, 1);
                  },1500);
                });
        }
        vm();

        function vm() {
            let viewUpdate = imageUpdate;
            let viewStart = function () {
            };
            /**
             * 役の定義
             */
            let roleTypes = {
                  NONE: 		{type: 0, maxCheckCount: 1}
                , REPLAY: 	{type: 1, maxCheckCount: 0}
                , BELL: 		{type: 2, maxCheckCount: 0}
                , CHERRY: 	{type: 3, maxCheckCount: 0}
                , BAR: 			{type: 4, maxCheckCount: 0}
                , SEVEN: 		{type: 5, maxCheckCount: 0}
                , PIRA: 		{type: 6, maxCheckCount: 0}
            };
            /**
             リール名
             */
            let reelNames = {
                  LEFT:   0
                , CENTER: 1
                , RIGHT:  2

            };
            /**
             各リールの役定義(適当なので)
             */
            let reelRoles = [
                [
                    roleTypes.REPLAY,
                    roleTypes.SEVEN,
                    roleTypes.PIRA,
                    roleTypes.SEVEN,
                    roleTypes.BELL,
                    roleTypes.REPLAY,
                    roleTypes.SIN,
                    roleTypes.GSIN,
                    roleTypes.SEVEN,
                    roleTypes.BELL,
                    roleTypes.REPLAY,
                    roleTypes.SIN,
                    roleTypes.GSIN,
                    roleTypes.PIRA,
                    roleTypes.BELL,
                    roleTypes.REPLAY,
                    roleTypes.BAR,
                    roleTypes.CHERRY,
                    roleTypes.SIN,
                    roleTypes.BELL,
                ],

                [
                    roleTypes.REPLAY,
                    roleTypes.BELL,
                    roleTypes.SEVEN,
                    roleTypes.CHERRY,
                    roleTypes.REPLAY,
                    roleTypes.BELL,
                    roleTypes.SIN,
                    roleTypes.CHERRY,
                    roleTypes.REPLAY,
                    roleTypes.BELL,
                    roleTypes.PIRA,
                    roleTypes.CHERRY,
                    roleTypes.REPLAY,
                    roleTypes.BELL,
                    roleTypes.PIRA,
                    roleTypes.CHERRY,
                    roleTypes.REPLAY,
                    roleTypes.BELL,
                    roleTypes.BAR,
                    roleTypes.CHERRY,
                ],

                [
                    roleTypes.GSIN,
                    roleTypes.SEVEN,
                    roleTypes.BELL,
                    roleTypes.SEVEN,
                    roleTypes.REPLAY,
                    roleTypes.GSIN,
                    roleTypes.CHERRY,
                    roleTypes.BELL,
                    roleTypes.SIN,
                    roleTypes.REPLAY,
                    roleTypes.GSIN,
                    roleTypes.CHERRY,
                    roleTypes.BELL,
                    roleTypes.PIRA,
                    roleTypes.REPLAY,
                    roleTypes.GSIN,
                    roleTypes.CHERRY,
                    roleTypes.BELL,
                    roleTypes.BAR,
                    roleTypes.REPLAY,
                ]
            ];

            viewEventBinder();
            
            let reelModel = new ReelManagerModel(reelRoles, reelNames);
            reelModel.obsNext = viewUpdate;
            reelModel.obsStop = viewStart;
            let slot = new Slot(reelModel, roleTypes);
            slot.start();         

    function viewEventBinder() {

      let leftBtn   = document.querySelector(".stopLeft");
      let centerBtn = document.querySelector(".stopCenter");
      let rightBtn  = document.querySelector(".stopRight");
      let startBtn  = document.querySelector("#startBtn");

      leftBtn.addEventListener("click", function () {
          reelModel.stop(reelNames.LEFT);
      }, false);
      centerBtn.addEventListener("click", function () {
          reelModel.stop(reelNames.CENTER);
      }, false);
      rightBtn.addEventListener("click", function () {
          reelModel.stop(reelNames.RIGHT);
      }, false);

      startBtn.addEventListener("click", function () {
          slot.leverOn();
      }, false);
    }
  }
}())