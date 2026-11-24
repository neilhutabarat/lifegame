/* simpan.js — simpan otomatis di HP (localStorage). Simpanan cloud menyusul. */
(function (g) {
  'use strict';
  var KUNCI = 'kopiKontainer.simpan.v1';
  g.KK_SIMPAN = {
    baca: function () { try { var t = localStorage.getItem(KUNCI); return t ? JSON.parse(t) : null; } catch (e) { return null; } },
    tulis: function (s) { try { localStorage.setItem(KUNCI, JSON.stringify(s)); return true; } catch (e) { return false; } },
    hapus: function () { try { localStorage.removeItem(KUNCI); } catch (e) {} }
  };
})(window);
