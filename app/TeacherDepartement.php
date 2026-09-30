<?php

namespace App;

/**
 * The institute's three departments. Stored as the acronyms themselves, which
 * is how they are written on the teacher cards and everywhere on campus.
 */
enum TeacherDepartement: string
{
    case Sti = 'STI';
    case Stgc = 'STGC';
    case Stnpa = 'STNPA';
}
