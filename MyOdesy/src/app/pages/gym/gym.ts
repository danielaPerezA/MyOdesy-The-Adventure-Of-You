import { Component } from '@angular/core';
import { Navbar } from '../../components/navbar/navbar';
import { Footer } from '../../components/footer/footer';

@Component({
  selector: 'app-gym',
  imports: [Navbar, Footer],
  templateUrl: './gym.html',
  styleUrl: './gym.scss',
})
export class Gym {
  username = 'DanielaUserPrueba';
}
